"""Model loading and inference for WheatGuard.

Matches the training notebook exactly:
  * every classifier head is  nn.Sequential(Dropout(0.5), Linear(...))
  * input = Resize(224,224) + ImageNet normalisation
  * weights are  <name>_best.pth  (resnet18, resnet50, mobilenet, convnext, vit)

MODEL_MODE (config/settings.py):
  "convnext"  -> best single model (fast, recommended for the first version)
  "ensemble"  -> weighted ensemble of every *_best.pth found in weights/

The Faster R-CNN detector is OPTIONAL: if weights/detector.pth is missing,
the site still works and shows classification only.
"""
import json
from functools import lru_cache
from pathlib import Path

from django.conf import settings
from PIL import Image, ImageDraw

WEIGHTS = Path(settings.WEIGHTS_DIR)
DEFAULT_CLASSES = ["Black Point", "Fusarium Foot Rot", "Healthy", "Leaf Blight", "Wheat Blast"]
DET_NAMES = ["__background__", "blackpoint", "fusariumfootrot", "leafblight", "wheatblast"]
ALL_NAMES = ["resnet18", "resnet50", "mobilenet", "convnext", "vit"]  # same order as the notebook


class ModelsNotReady(Exception):
    pass


def _torch():
    try:
        import torch, torchvision  # noqa
        return torch, torchvision
    except ImportError as e:
        raise ModelsNotReady("PyTorch is not installed. Run: pip install torch torchvision") from e


@lru_cache(maxsize=1)
def class_names():
    """Read weights/classes.json (saved from base_dataset.classes)."""
    p = WEIGHTS / "classes.json"
    return json.loads(p.read_text()) if p.exists() else DEFAULT_CLASSES


def build_model(name):
    """Same architecture + head as the notebook's get_models()."""
    torch, tv = _torch()
    nn, m = torch.nn, tv.models
    n = len(class_names())

    def head(in_f):
        return nn.Sequential(nn.Dropout(0.5), nn.Linear(in_f, n))

    if name == "resnet18":
        model = m.resnet18(weights=None); model.fc = head(model.fc.in_features)
    elif name == "resnet50":
        model = m.resnet50(weights=None); model.fc = head(model.fc.in_features)
    elif name == "mobilenet":
        model = m.mobilenet_v2(weights=None)
        model.classifier[1] = head(model.classifier[1].in_features)
    elif name == "convnext":
        model = m.convnext_tiny(weights=None)
        model.classifier[2] = head(model.classifier[2].in_features)
    elif name == "vit":
        model = m.vit_b_16(weights=None); model.heads.head = head(model.heads.head.in_features)
    else:
        raise ValueError(name)
    return model


@lru_cache(maxsize=1)
def load_classifiers():
    """Returns ([models], [weights]) according to MODEL_MODE."""
    torch, _ = _torch()
    names = ["convnext"] if settings.MODEL_MODE == "convnext" else ALL_NAMES
    models, found = [], []
    for name in names:
        f = WEIGHTS / f"{name}_best.pth"
        if not f.exists():
            if settings.MODEL_MODE == "convnext":
                raise ModelsNotReady(f"Missing weights file: {f}")
            continue                      # ensemble: skip models that are not there
        model = build_model(name)
        model.load_state_dict(torch.load(f, map_location="cpu"))
        models.append(model.eval()); found.append(name)
    if not models:
        raise ModelsNotReady(f"No *_best.pth files found in {WEIGHTS}")

    # ensemble weights = validation accuracy, normalised (as in the notebook)
    wf = WEIGHTS / "weights.json"
    scores = json.loads(wf.read_text()) if wf.exists() else {}
    w = torch.tensor([float(scores.get(n, 1.0)) for n in found])
    return models, (w / w.sum()).tolist()


def classify(img: Image.Image):
    torch, tv = _torch()
    T = tv.transforms
    tf = T.Compose([T.Resize((224, 224)), T.ToTensor(),
                    T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])
    x = tf(img).unsqueeze(0)
    models, w = load_classifiers()
    with torch.no_grad():
        probs = sum(torch.softmax(m(x), dim=1)[0] * wi for m, wi in zip(models, w))
    names = class_names()
    return [(names[i], float(probs[i]) * 100) for i in probs.argsort(descending=True).tolist()]


@lru_cache(maxsize=1)
def load_detector():
    torch, tv = _torch()
    f = WEIGHTS / "detector.pth"
    if not f.exists():
        raise ModelsNotReady("detector.pth not found (classification only)")
    model = tv.models.detection.fasterrcnn_resnet50_fpn(weights=None, weights_backbone=None)
    in_f = model.roi_heads.box_predictor.cls_score.in_features
    model.roi_heads.box_predictor = tv.models.detection.faster_rcnn.FastRCNNPredictor(in_f, len(DET_NAMES))
    model.load_state_dict(torch.load(f, map_location="cpu"))
    return model.eval()


def detect(img: Image.Image, threshold: float):
    torch, tv = _torch()
    model = load_detector()
    with torch.no_grad():
        out = model([tv.transforms.functional.to_tensor(img)])[0]
    return [(b.tolist(), DET_NAMES[int(l)], float(s))
            for b, l, s in zip(out["boxes"], out["labels"], out["scores"]) if float(s) >= threshold]


def draw_boxes(img: Image.Image, boxes):
    out = img.copy()
    d = ImageDraw.Draw(out)
    for (x1, y1, x2, y2), name, score in boxes:
        d.rectangle([x1, y1, x2, y2], outline="red", width=4)
        d.text((x1 + 4, max(y1 - 14, 0)), f"{name}: {score:.2f}", fill="red")
    return out
