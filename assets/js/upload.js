class ImageUploader {
    constructor() {
      this.config = {
        maxSize: 100 * 1024 * 1024, // 100MB
        allowedTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/tiff',
          'image/x-tiff'
        ]
      };
  
      this.elements = {
        dropZone: document.getElementById('dropZone'),
        fileInput: document.getElementById('fileInput'),
        previewImage: document.getElementById('previewImage'),
        uploadContent: document.getElementById('uploadContent'),
        imagePreview: document.getElementById('imagePreview'),
        analyzeBtn: document.getElementById('analyzeBtn'),
        loadingModal: document.getElementById('loadingModal')
      };
  
      this.init();
    }
  
    init() {
      if (!this.elements.dropZone) return;
  
      this.setupDragAndDrop();
      this.setupFileInput();
      this.setupButtons();
    }
  
    setupDragAndDrop() {
      const { dropZone } = this.elements;
  
      // Prevent default drag behaviors
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
        dropZone.addEventListener(event, this.preventDefaults);
        document.body.addEventListener(event, this.preventDefaults);
      });
  
      // Highlight drop zone
      ['dragenter', 'dragover'].forEach(event => {
        dropZone.addEventListener(event, () => dropZone.classList.add('highlight'));
      });
  
      ['dragleave', 'drop'].forEach(event => {
        dropZone.addEventListener(event, () => dropZone.classList.remove('highlight'));
      });
  
      // Handle dropped files
      dropZone.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (file) this.handleFile(file);
      });
    }
  
    setupFileInput() {
      this.elements.fileInput.addEventListener('change', () => {
        if (this.elements.fileInput.files.length) {
          this.handleFile(this.elements.fileInput.files[0]);
        }
      });
  
      document.getElementById('browseBtn').addEventListener('click', (e) => {
        e.preventDefault();
        this.elements.fileInput.click();
      });
    }
  
    setupButtons() {
      document.getElementById('clearBtn').addEventListener('click', () => {
        this.resetUploader();
      });
  
      this.elements.analyzeBtn.addEventListener('click', async () => {
        if (!this.elements.previewImage.src) {
          this.showAlert('Please upload an image first');
          return;
        }
        
        await this.startAnalysis();
      });
    }
  
    handleFile(file) {
      // Validate file type
      if (!this.config.allowedTypes.includes(file.type)) {
        this.showAlert('Please upload a valid image (JPEG, PNG, WEBP, TIFF)');
        return;
      }
  
      // Validate file size
      if (file.size > this.config.maxSize) {
        this.showAlert(`File too large (max ${this.formatFileSize(this.config.maxSize)})`);
        return;
      }
  
      // Preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        this.elements.previewImage.src = e.target.result;
        this.elements.imagePreview.style.display = 'block';
        this.elements.uploadContent.style.display = 'none';
        localStorage.setItem('uploadedImage', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  


    


    async startAnalysis() {
      this.showLoading(true);
    
      try {
        const uploadedImage = localStorage.getItem('uploadedImage');
        if (!uploadedImage) throw new Error('No image found in storage.');
    
        // Convert base64 to Blob object for file-like object
        const byteCharacters = atob(uploadedImage.split(',')[1]);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          byteArrays.push(new Uint8Array(byteNumbers));
        }
        const blob = new Blob(byteArrays, { type: 'image/jpeg' });
    
        const formData = new FormData();
        formData.append('image', blob, 'image.jpg');  // Adjust filename if needed
    
        // Send image as FormData to backend
        const response = await fetch('http://127.0.0.1:8000/api/v1/detect', {
          method: 'POST',
          body: formData
        });
    
        if (!response.ok) {
          throw new Error('Failed to analyze image.');
        }
    
        const result = await response.json();
        localStorage.setItem('analysisResults', JSON.stringify(result));
        window.location.href = 'result.html';
    
      } catch (error) {
        this.showAlert('Analysis failed. Please try again.');
        console.error('Analysis error:', error); // important
      } finally {
        this.showLoading(false);
      }
    }
    
    
  
  


   
  
  




    
    simulateAnalysis() {
      return new Promise(resolve => {
        let progress = 0;
        const progressFill = document.getElementById('progressFill');
        
        const interval = setInterval(() => {
          progress += Math.random() * 15;
          if (progress >= 100) {
            clearInterval(interval);
            resolve();
          }
          progressFill.style.width = `${progress}%`;
        }, 300);
      });
    }
  
    // Helper methods
    preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
  
    resetUploader() {
      this.elements.previewImage.src = '';
      this.elements.fileInput.value = '';
      this.elements.imagePreview.style.display = 'none';
      this.elements.uploadContent.style.display = 'block';
    }
  
    showAlert(message) {
      const alertBox = document.createElement('div');
      alertBox.className = 'upload-alert';
      alertBox.textContent = message;
      document.body.appendChild(alertBox);
      setTimeout(() => alertBox.remove(), 3000);
    }
  
    showLoading(show) {
      this.elements.loadingModal.style.display = show ? 'flex' : 'none';
    }
  
    formatFileSize(bytes) {
      if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + 'GB';
      if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + 'MB';
      return (bytes / 1e3).toFixed(1) + 'KB';
    }
  }
  
  // Initialize
  document.addEventListener('DOMContentLoaded', () => new ImageUploader());
  