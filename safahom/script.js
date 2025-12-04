class SafahomesApp {
    constructor() {
        this.promptInput = document.getElementById('promptInput');
        this.generateBtn = document.getElementById('generateBtn');
        this.loading = document.getElementById('loading');
        this.resultSection = document.getElementById('resultSection');
        this.generatedImage = document.getElementById('generatedImage');
        this.currentPrompt = document.getElementById('currentPrompt');
        this.historyList = document.getElementById('historyList');
        
        this.init();
    }
    
    init() {
        this.generateBtn.addEventListener('click', () => this.generateImage());
        this.promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.generateImage();
            }
        });
        
        this.loadHistory();
        setInterval(() => this.loadHistory(), 5000); // Refresh history
    }
    
    async generateImage() {
        const prompt = this.promptInput.value.trim();
        if (!prompt) {
            alert('Please enter a design prompt!');
            return;
        }
        
        this.showLoading();
        this.generateBtn.disabled = true;
        
        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({prompt})
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.generatedImage.src = data.image;
                this.currentPrompt.textContent = `"${data.prompt}"`;
                this.showResult();
                this.promptInput.value = '';
            } else {
                alert('Generation failed: ' + data.error);
            }
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            this.hideLoading();
            this.generateBtn.disabled = false;
        }
    }
    
    async loadHistory() {
        try {
            const response = await fetch('/history');
            const history = await response.json();
            
            this.renderHistory(history);
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }
    
    renderHistory(history) {
        this.historyList.innerHTML = '';
        
        history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <img src="${item.image}" alt="Generated design" onclick="app.showFullImage('${item.image}')">
                <div class="history-prompt">${item.prompt.substring(0, 80)}${item.prompt.length > 80 ? '...' : ''}</div>
                <small>${new Date(item.timestamp).toLocaleString()}</small>
            `;
            this.historyList.appendChild(historyItem);
        });
    }
    
    showFullImage(imageSrc) {
        this.generatedImage.src = imageSrc;
        this.resultSection.classList.remove('hidden');
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    showLoading() {
        this.loading.classList.remove('hidden');
        this.resultSection.classList.add('hidden');
    }
    
    hideLoading() {
        this.loading.classList.add('hidden');
    }
    
    showResult() {
        this.resultSection.classList.remove('hidden');
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }
}

const app = new SafahomesApp();
