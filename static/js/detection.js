/* ============================================================
   WheatGuard - detection.js
   Full AI Backend Integration:
   • Real Neural Network Inference via Django API
   • Drag & Drop Image Upload with Instant Preview
   • Quick One-Click Sample Testing (Blast, Blight, Rot, etc.)
   • Multi-Class Confidence Breakdown & Treatment Guidelines
   • Drone Video & Sector Telemetry Scanning
   • Diagnostic Report Export / Print
   ============================================================ */

var selectedImageFile = null;

// Helper: Get Django CSRF Cookie
function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function getCsrfToken() {
  var input = document.querySelector('[name=csrfmiddlewaretoken]');
  return (input && input.value) || getCookie('csrftoken') || '';
}

// ── Toast Notification ──────────────────────────────────────
function showToast(message, type) {
  var container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  var toast = document.createElement('div');
  toast.className = 'toast ' + (type || 'info');
  var icon = type === 'error' ? '⚠️ ' : (type === 'success' ? '✅ ' : 'ℹ️ ');
  toast.innerHTML = '<span>' + icon + '</span><span>' + message + '</span>';
  container.appendChild(toast);

  setTimeout(function () {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 4000);
}

// ── Image Upload & Preview ──────────────────────────────────
function handleImageUpload(event) {
  var file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file (JPG or PNG).', 'error');
    return;
  }

  selectedImageFile = file;

  var reader = new FileReader();
  reader.onload = function (e) {
    var previewImg = document.getElementById('preview-img');
    var previewWrap = document.getElementById('img-preview');
    var analyzeBtn = document.getElementById('analyze-btn');
    var resultBox = document.getElementById('result-box');

    if (previewImg) previewImg.src = e.target.result;
    if (previewWrap) previewWrap.style.display = 'block';
    if (analyzeBtn) {
      analyzeBtn.classList.add('show');
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = 'Analyze Image with AI →';
    }
    if (resultBox) resultBox.classList.remove('show');
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  selectedImageFile = null;
  var input = document.getElementById('img-input');
  if (input) input.value = '';

  var previewWrap = document.getElementById('img-preview');
  var analyzeBtn = document.getElementById('analyze-btn');
  var resultBox = document.getElementById('result-box');
  var loadingBar = document.getElementById('loading-bar');
  var loadingText = document.getElementById('loading-status-text');

  if (previewWrap) previewWrap.style.display = 'none';
  if (analyzeBtn) analyzeBtn.classList.remove('show');
  if (resultBox) resultBox.classList.remove('show');
  if (loadingBar) loadingBar.classList.remove('show');
  if (loadingText) loadingText.classList.remove('show');
}

// ── Sample Registry for Quick Testing ────────────────────────
var SAMPLE_REGISTRY = {
  'wheat_blast': {
    name: 'Wheat Blast',
    url: '/static/images/samples/wheat_blast.jpg'
  },
  'leaf_blight': {
    name: 'Leaf Blight',
    url: '/static/images/samples/leaf_blight.jpg'
  },
  'fusarium_foot_rot': {
    name: 'Fusarium Foot Rot',
    url: '/static/images/samples/fusarium_foot_rot.jpg'
  },
  'black_point': {
    name: 'Black Point',
    url: '/static/images/samples/black_point.jpg'
  },
  'healthy': {
    name: 'Healthy Crop',
    url: '/static/images/samples/healthy_wheat.jpg'
  }
};

function quickTest(sampleId) {
  var s = SAMPLE_REGISTRY[sampleId];
  if (!s) return;
  loadSampleAndAnalyze(sampleId, s.url, s.name);
}

// ── Quick One-Click Sample Testing ──────────────────────────
function loadSampleAndAnalyze(sampleId, sampleUrl, sampleName) {
  // Navigate to services section if not there
  showSection('services');

  var previewImg = document.getElementById('preview-img');
  var previewWrap = document.getElementById('img-preview');
  var analyzeBtn = document.getElementById('analyze-btn');
  var resultBox = document.getElementById('result-box');

  if (previewImg) previewImg.src = sampleUrl;
  if (previewWrap) previewWrap.style.display = 'block';
  if (resultBox) resultBox.classList.remove('show');

  showToast('Loading reference sample: ' + sampleName + '...', 'info');

  // Trigger sample inference directly
  runSampleInference(sampleId);
}

function runSampleInference(sampleId) {
  var btn = document.getElementById('analyze-btn');
  var lb = document.getElementById('loading-bar');
  var lt = document.getElementById('loading-status-text');
  var rb = document.getElementById('result-box');

  if (btn) {
    btn.classList.add('show');
    btn.disabled = true;
    btn.textContent = 'Processing Sample...';
  }
  if (lb) lb.classList.add('show');
  if (lt) {
    lt.classList.add('show');
    lt.textContent = 'Executing ConvNeXt deep neural classifier...';
  }
  if (rb) rb.classList.remove('show');

  fetch('/api/detect-sample/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken()
    },
    body: JSON.stringify({ sample_id: sampleId })
  })
    .then(function (response) {
      if (!response.ok) throw new Error('Server returned HTTP ' + response.status);
      return response.json();
    })
    .then(function (data) {
      if (!data.success) {
        throw new Error(data.error || 'Sample diagnosis failed.');
      }
      displayImageResult(data);
      showToast('Diagnosis complete for ' + data.top_prediction.name, 'success');
    })
    .catch(function (err) {
      showToast(err.message, 'error');
    })
    .finally(function () {
      if (lb) lb.classList.remove('show');
      if (lt) lt.classList.remove('show');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Re-Analyze Image →';
      }
    });
}

// ── Image Analysis with Real PyTorch Backend ─────────────────
function analyzeImage() {
  if (!selectedImageFile) {
    showToast('Please upload an image first or pick a sample.', 'error');
    return;
  }

  var btn = document.getElementById('analyze-btn');
  var lb = document.getElementById('loading-bar');
  var lt = document.getElementById('loading-status-text');
  var rb = document.getElementById('result-box');

  // UI: loading state
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Diagnosing with AI Model...';
  }
  if (lb) lb.classList.add('show');
  if (lt) {
    lt.classList.add('show');
    lt.textContent = 'Extracting wheat tissue features via deep learning...';
  }
  if (rb) rb.classList.remove('show');

  var formData = new FormData();
  formData.append('image', selectedImageFile);

  fetch('/api/detect/', {
    method: 'POST',
    headers: {
      'X-CSRFToken': getCsrfToken()
    },
    body: formData
  })
    .then(function (response) {
      if (!response.ok) {
        return response.json().then(function (errData) {
          throw new Error(errData.error || 'Server error (' + response.status + ')');
        });
      }
      return response.json();
    })
    .then(function (data) {
      if (!data.success) {
        throw new Error(data.error || 'Inference unsuccessful.');
      }
      displayImageResult(data);
      showToast('Wheat crop diagnosis completed successfully!', 'success');
    })
    .catch(function (err) {
      showToast('Error: ' + err.message, 'error');
    })
    .finally(function () {
      if (lb) lb.classList.remove('show');
      if (lt) lt.classList.remove('show');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Re-Analyze Image →';
      }
    });
}

// ── Render Rich Diagnosis Results ───────────────────────────
function displayImageResult(data) {
  var top = data.top_prediction;
  var rb = document.getElementById('result-box');
  if (!rb) return;

  var nameEl = document.getElementById('result-name');
  var sciEl = document.getElementById('result-scientific');
  var confEl = document.getElementById('result-conf');
  var confFill = document.getElementById('result-conf-fill');
  var sevBadge = document.getElementById('result-sev-badge');
  var descEl = document.getElementById('result-desc');
  var symptomsEl = document.getElementById('result-symptoms');
  var treatmentEl = document.getElementById('result-treatment');
  var breakdownList = document.getElementById('all-predictions-list');

  // Name & Color
  if (nameEl) {
    nameEl.textContent = top.name;
    nameEl.style.color = top.color || '#e5b02a';
  }
  if (sciEl) {
    sciEl.textContent = top.scientific_name ? ('(' + top.scientific_name + ')') : '';
  }

  // Confidence
  if (confEl) confEl.textContent = top.conf || (top.confidence + '%');
  if (confFill) {
    confFill.style.width = '0%';
    setTimeout(function () {
      confFill.style.width = (top.confidence || 0) + '%';
      confFill.style.backgroundColor = top.color || '#e5b02a';
    }, 50);
  }

  // Severity Badge
  if (sevBadge) {
    var sev = top.severity || (top.type === 'healthy' ? 'None' : 'Moderate');
    sevBadge.textContent = 'Severity: ' + sev;
    sevBadge.className = 'result-severity-badge sev-' + sev;
  }

  // Descriptions & Guidance
  if (descEl) descEl.textContent = top.desc || '';
  if (symptomsEl) symptomsEl.textContent = top.symptoms || 'Visual tissue irregularity.';
  if (treatmentEl) treatmentEl.textContent = top.treatment || 'Consult agricultural adviser.';

  // Probability distribution breakdown
  if (breakdownList && data.predictions) {
    breakdownList.innerHTML = '';
    data.predictions.forEach(function (pred) {
      var item = document.createElement('div');
      item.className = 'pred-item';
      item.innerHTML =
        '<div class="pred-header">' +
          '<span>' + pred.name + '</span>' +
          '<strong>' + pred.conf + '</strong>' +
        '</div>' +
        '<div class="pred-bar">' +
          '<div class="pred-fill" style="width: ' + pred.score + '%; background-color: ' + (pred.color || '#e5b02a') + '"></div>' +
        '</div>';
      breakdownList.appendChild(item);
    });
  }

  // Annotated detection view (Faster R-CNN)
  var annotWrap = document.getElementById('annotated-result-wrap');
  var annotImg = document.getElementById('annotated-result-img');
  if (annotWrap && annotImg) {
    if (data.annotated_url) {
      annotImg.src = data.annotated_url;
      annotWrap.style.display = 'block';
    } else {
      annotWrap.style.display = 'none';
    }
  }

  // Apply card styling class
  rb.className = 'result-box show ' + (top.type === 'healthy' ? 'healthy' : 'disease');

  // Scroll smoothly to result
  rb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Export / Print Diagnostic Report ────────────────────────
function exportDiagnosticReport() {
  window.print();
}

// ── Drone / Video Upload & Telemetry ────────────────────────
function handleVideoUpload(event) {
  var file = event.target.files && event.target.files[0];
  if (!file) return;

  var vl = document.getElementById('video-loading');
  var vr = document.getElementById('video-result');

  if (vl) vl.classList.add('show');
  if (vr) vr.classList.remove('show');

  showToast('Initiating aerial field mission scan...', 'info');

  var formData = new FormData();
  formData.append('video', file);

  fetch('/api/detect-drone/', {
    method: 'POST',
    headers: {
      'X-CSRFToken': getCsrfToken()
    },
    body: formData
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (!data.success) throw new Error(data.error || 'Video scan failed');

      if (vl) vl.classList.remove('show');

      var vrName = document.getElementById('video-result-name');
      var vrDesc = document.getElementById('video-result-desc');
      var vrFrames = document.getElementById('telemetry-frames');
      var vrSpread = document.getElementById('telemetry-spread');
      var vrGps = document.getElementById('telemetry-gps');
      var vrArea = document.getElementById('telemetry-area');
      var vrSectors = document.getElementById('drone-sectors-list');

      var dom = data.dominant_disease;
      if (vrName) {
        vrName.textContent = dom.name + (dom.type === 'disease' ? ' Identified in Sector Scan' : ' — Healthy Field');
        vrName.style.color = dom.color;
      }
      if (vrDesc) {
        vrDesc.textContent = dom.desc + ' Analyzed across ' + data.frames_scanned + ' aerial multi-spectral frames with ' + data.infection_spread_pct + '% canopy risk index.';
      }
      if (vrFrames) vrFrames.textContent = data.frames_scanned + ' Frames (' + data.infected_frames + ' Alert)';
      if (vrSpread) vrSpread.textContent = data.infection_spread_pct + '% Area';
      if (vrGps) vrGps.textContent = data.telemetry.gps_coordinates;
      if (vrArea) vrArea.textContent = data.telemetry.coverage_area;

      if (vrSectors && data.sectors) {
        vrSectors.innerHTML = '';
        data.sectors.forEach(function (sec) {
          var sEl = document.createElement('div');
          sEl.className = 'drone-feature-item';
          sEl.innerHTML = '<strong>' + sec.name + ':</strong> ' + sec.status + ' (' + sec.coverage + ')';
          vrSectors.appendChild(sEl);
        });
      }

      if (vr) vr.className = 'result-box show ' + (dom.type === 'disease' ? 'disease' : 'healthy');
      showToast('Drone mission telemetric report ready.', 'success');
    })
    .catch(function (err) {
      if (vl) vl.classList.remove('show');
      showToast('Drone scan error: ' + err.message, 'error');
    });
}

// ── Drag & Drop for Image Upload Zone ──────────────────────
(function () {
  var zone = document.getElementById('img-upload-zone');
  if (!zone) return;

  zone.addEventListener('dragover', function (e) {
    e.preventDefault();
    zone.classList.add('dragover');
  });

  zone.addEventListener('dragleave', function () {
    zone.classList.remove('dragover');
  });

  zone.addEventListener('drop', function (e) {
    e.preventDefault();
    zone.classList.remove('dragover');

    var file = e.dataTransfer && e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload({ target: { files: [file] } });
    } else {
      showToast('Please drop a valid image file.', 'error');
    }
  });
})();
