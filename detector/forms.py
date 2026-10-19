from django import forms

ALLOWED = {"image/jpeg", "image/png"}


class UploadForm(forms.Form):
    image = forms.ImageField()

    def clean_image(self):
        f = self.cleaned_data["image"]
        if f.content_type not in ALLOWED:
            raise forms.ValidationError("Only JPG or PNG images are allowed.")
        if f.size > 10 * 1024 * 1024:
            raise forms.ValidationError("Image must be smaller than 10 MB.")
        return f
