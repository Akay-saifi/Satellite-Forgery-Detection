class ResultViewer {
  constructor() {
      this.elements = {
          originalImage: document.getElementById('originalImage'),
          heatmapImage: document.getElementById('heatmapImage'),
          verdictBanner: document.getElementById('verdictBanner'),
          findingsContent: document.getElementById('findingsContent'),
        //   manipulatedArea: document.getElementById('manipulatedArea'),
          anomalySeverity: document.getElementById('anomalySeverity'),
          modelConfidence: document.getElementById('modelConfidence')
      };

      this.results = this.getStoredResults();
      this.init();
  }

  init() {
      if (!this.results) {
          window.location.href = 'upload.html';
          return;
      }

      this.displayResults();
      this.setupEventListeners();
      this.setAnalysisTime();
  }

  getStoredResults() {
      try {
          const image = localStorage.getItem('uploadedImage');
          const results = JSON.parse(localStorage.getItem('analysisResults'));
          return image && results ? { image, ...results } : null;
      } catch (e) {
          console.error('Error parsing results:', e);
          return null;
      }
  }

  setAnalysisTime() {
      const now = new Date();
      document.getElementById('analysisTime').textContent = 
          `${now.toLocaleTimeString()} • ${now.toLocaleDateString()}`;
  }

  displayResults() {
      const { 
          image, 
          is_authentic, 
          confidence, 
          findings, 
          manipulated_regions,
          processing_time,
          model_metrics
      } = this.results;

      // Display images
      this.elements.originalImage.src = image;
      this.generateAccurateHeatmap(manipulated_regions || []);

      // Set verdict
      const verdictIcon = this.elements.verdictBanner.querySelector('.verdict-icon i');
      
      if (is_authentic) {
          this.elements.verdictBanner.className = 'verdict-banner';
          verdictIcon.className = 'fas fa-check-circle';
          this.elements.verdictBanner.querySelector('h3').textContent = 'Authentic Satellite Image';
      } else {
          this.elements.verdictBanner.className = 'verdict-banner fake';
          verdictIcon.className = 'fas fa-exclamation-circle';
          this.elements.verdictBanner.querySelector('h3').textContent = 'Potential Image Manipulation';
      }

      this.elements.verdictBanner.querySelector('p').textContent = 
          `Confidence: ${confidence}% ${confidence > 70 ? '(High)' : '(Moderate)'}`;

      // Set indicators
      this.elements.modelConfidence.textContent = `${confidence}%`;
      
      const manipulatedArea = this.calculateManipulatedArea(manipulated_regions || []);
      this.elements.manipulatedArea.textContent = `${manipulatedArea}%`;
      
      const severity = confidence > 85 ? 'High' : 
                      confidence > 60 ? 'Medium' : 'Low';
      this.elements.anomalySeverity.textContent = severity;

      // Set findings
      if (findings) {
          let findingsHTML = '';
          
          if (findings.structural) {
              findingsHTML += `
                  <div class="finding-category">
                      <h4><i class="fas fa-landmark"></i> Structural Anomalies</h4>
                      <ul>
                          ${findings.structural.map(item => `<li>${item}</li>`).join('')}
                      </ul>
                  </div>`;
          }
          
          if (findings.environmental) {
              findingsHTML += `
                  <div class="finding-category">
                      <h4><i class="fas fa-cloud"></i> Environmental Inconsistencies</h4>
                      <ul>
                          ${findings.environmental.map(item => `<li>${item}</li>`).join('')}
                      </ul>
                  </div>`;
          }
          
          this.elements.findingsContent.innerHTML = findingsHTML;
      }

      // Set technical details
      if (processing_time) {
          document.getElementById('totalProcessingTime').textContent = `${processing_time.toFixed(1)}s`;
      }
      
      if (model_metrics) {
          document.getElementById('detectionThreshold').textContent = model_metrics.threshold || '0.82';
          document.getElementById('falsePositiveRate').textContent = model_metrics.false_positive_rate ? 
              `${(model_metrics.false_positive_rate * 100).toFixed(1)}%` : '3.2%';
      }
  }

  generateAccurateHeatmap(regions) {
      const img = this.elements.originalImage;
      const canvas = document.createElement('canvas');
      const heatmapImg = this.elements.heatmapImage;

      img.onload = () => {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          
          // Draw original image with reduced opacity
          ctx.globalAlpha = 0.7;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Draw manipulation regions
          ctx.globalAlpha = 0.8;
          regions.forEach(region => {
              const { x, y, width, height, confidence } = region;
              
              // Color based on confidence (green to red)
              const hue = 120 - (confidence * 1.2);
              ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.4)`;
              ctx.fillRect(x, y, width, height);
              
              // Border for high confidence regions
              if (confidence > 70) {
                  ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 0.8)`;
                  ctx.lineWidth = 2;
                  ctx.strokeRect(x, y, width, height);
              }
          });
          
          heatmapImg.src = canvas.toDataURL();
      };
  }

//   calculateManipulatedArea(regions) {
//       if (!regions || regions.length === 0) return 0;
      
//       const img = this.elements.originalImage;
//       const totalPixels = img.naturalWidth * img.naturalHeight;
//       let manipulatedPixels = 0;
      
//       regions.forEach(region => {
//           manipulatedPixels += region.width * region.height;
//       });
      
//       return Math.round((manipulatedPixels / totalPixels) * 100);
//   }

  setupEventListeners() {
      // Navigation buttons
      document.getElementById('newAnalysisBtn').addEventListener('click', () => {
          window.location.href = 'upload.html';
      });

      document.getElementById('downloadReportBtn').addEventListener('click', () => {
          this.downloadReport();
      });

      document.getElementById('expertModeBtn').addEventListener('click', () => {
          this.toggleExpertMode();
      });

      // Image tools
      document.getElementById('zoomInBtn').addEventListener('click', () => {
          this.zoomImage(1.2);
      });

      document.getElementById('zoomOutBtn').addEventListener('click', () => {
          this.zoomImage(0.8);
      });

      document.getElementById('fullscreenBtn').addEventListener('click', () => {
          this.toggleFullscreen(this.elements.originalImage);
      });
  }

  zoomImage(factor) {
      const currentWidth = parseFloat(this.elements.originalImage.style.width) || 
                         this.elements.originalImage.offsetWidth;
      const newWidth = currentWidth * factor;
      
      this.elements.originalImage.style.width = `${newWidth}px`;
      this.elements.heatmapImage.style.width = `${newWidth}px`;
  }

  toggleFullscreen(element) {
      if (!document.fullscreenElement) {
          element.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
      } else {
          document.exitFullscreen();
      }
  }

  toggleExpertMode() {
      document.body.classList.toggle('expert-mode');
      const btn = document.getElementById('expertModeBtn');
      if (document.body.classList.contains('expert-mode')) {
          btn.innerHTML = '<i class="fas fa-user"></i> Normal Mode';
      } else {
          btn.innerHTML = '<i class="fas fa-user-ninja"></i> Expert Mode';
      }
  }

  downloadReport() {
      // In a real implementation, you would generate a PDF here
      console.log('Generating PDF report...');
      
      // For demo purposes, create a simple PDF download
      const blob = new Blob(['Satellite Image Analysis Report\n\nAuthenticity: 87%\nFindings: 5 anomalies detected'], 
                           { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'satellite_analysis_report.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => new ResultViewer());