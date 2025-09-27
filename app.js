// Combined Music Streaming & Distribution App
class CombinedMusicApp {
    constructor() {
        this.streamingPlaylist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.isShuffle = false;
        this.repeatMode = 'none';
        this.currentStep = 1;
        this.totalSteps = 4;
        
        this.initializeApp();
    }

    initializeApp() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadStreamingPlaylist();
        this.updatePlaylistDisplay();
        this.updateStepCircles();
    }

    initializeElements() {
        // Page navigation elements
        this.currentPage = 'home';
        
        // Upload elements (for distribution)
        this.uploadArea = document.getElementById('audio-drop-zone');
        this.fileInput = document.getElementById('song');
        
        // Streaming elements
        this.streamingUploadArea = document.getElementById('streamingUploadArea');
        this.streamingFileInput = document.getElementById('streamingFileInput');
        this.streamingSearchInput = document.getElementById('streamingSearchInput');
        this.streamingClearSearch = document.getElementById('streamingClearSearch');
        this.streamingPlaylist = document.getElementById('streamingPlaylist');
        
        // Music player elements
        this.musicPlayer = document.getElementById('musicPlayer');
        this.audioPlayer = document.getElementById('mainAudioPlayer');
        this.playerPlayBtn = document.getElementById('playerPlayBtn');
        this.playerPrevBtn = document.getElementById('playerPrevBtn');
        this.playerNextBtn = document.getElementById('playerNextBtn');
        this.playerTitle = document.getElementById('playerTitle');
        this.playerArtist = document.getElementById('playerArtist');
        this.playerCover = document.getElementById('playerCover');
        this.playerProgress = document.getElementById('playerProgress');
        this.playerProgressSlider = document.getElementById('playerProgressSlider');
        this.playerCurrentTime = document.getElementById('playerCurrentTime');
        this.playerTotalTime = document.getElementById('playerTotalTime');
        this.playerVolumeSlider = document.getElementById('playerVolumeSlider');
        
        // Control buttons
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        
        // Song status form
        this.songStatusForm = document.getElementById('song-status-form');
    }

    setupEventListeners() {
        // Streaming upload events
        if (this.streamingUploadArea && this.streamingFileInput) {
            this.streamingUploadArea.addEventListener('click', () => this.streamingFileInput.click());
            this.streamingFileInput.addEventListener('change', (e) => this.handleStreamingFileSelect(e));
            this.setupStreamingDragAndDrop();
        }
        
        // Search events
        if (this.streamingSearchInput) {
            this.streamingSearchInput.addEventListener('input', () => this.handleStreamingSearch());
        }
        if (this.streamingClearSearch) {
            this.streamingClearSearch.addEventListener('click', () => this.clearStreamingSearch());
        }
        
        // Player control events
        if (this.playerPlayBtn) {
            this.playerPlayBtn.addEventListener('click', () => this.togglePlayPause());
        }
        if (this.playerPrevBtn) {
            this.playerPrevBtn.addEventListener('click', () => this.previousTrack());
        }
        if (this.playerNextBtn) {
            this.playerNextBtn.addEventListener('click', () => this.nextTrack());
        }
        
        // Audio events
        if (this.audioPlayer) {
            this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
            this.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
            this.audioPlayer.addEventListener('ended', () => this.handleTrackEnd());
        }
        
        // Progress and volume events
        if (this.playerProgressSlider) {
            this.playerProgressSlider.addEventListener('input', () => this.seekTo());
        }
        if (this.playerVolumeSlider) {
            this.playerVolumeSlider.addEventListener('input', () => this.setVolume());
            this.setVolume(); // Initialize volume
        }
        
        // Control buttons
        if (this.shuffleBtn) {
            this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        }
        if (this.clearAllBtn) {
            this.clearAllBtn.addEventListener('click', () => this.clearStreamingPlaylist());
        }
        
        // Distribution upload events
        this.setupDistributionDragAndDrop();
        this.setupDistributionFileHandlers();
        
        // Song status form
        if (this.songStatusForm) {
            this.songStatusForm.addEventListener('submit', (e) => this.handleSongStatusSearch(e));
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // Streaming functionality
    setupStreamingDragAndDrop() {
        if (!this.streamingUploadArea) return;
        
        this.streamingUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.streamingUploadArea.classList.add('border-purple-500', 'bg-purple-50');
        });
        
        this.streamingUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.streamingUploadArea.classList.remove('border-purple-500', 'bg-purple-50');
        });
        
        this.streamingUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.streamingUploadArea.classList.remove('border-purple-500', 'bg-purple-50');
            const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('audio/'));
            this.processStreamingFiles(files);
        });
    }

    handleStreamingFileSelect(event) {
        const files = Array.from(event.target.files);
        this.processStreamingFiles(files);
    }

    async processStreamingFiles(files) {
        const audioFiles = files.filter(file => file.type.startsWith('audio/'));
        
        if (audioFiles.length === 0) {
            this.showToast('กรุณาเลือกไฟล์เสียงที่รองรับ', 'error');
            return;
        }

        if (audioFiles.some(file => file.size > 50 * 1024 * 1024)) {
            this.showToast('ขนาดไฟล์ต้องไม่เกิน 50MB', 'error');
            return;
        }

        try {
            for (const file of audioFiles) {
                await this.addStreamingTrack(file);
            }
            
            this.saveStreamingPlaylist();
            this.updatePlaylistDisplay();
            this.showToast(`เพิ่มเพลง ${audioFiles.length} เพลงเรียบร้อยแล้ว`, 'success');
            
            if (this.streamingPlaylist.length === audioFiles.length) {
                this.showMusicPlayer();
                this.loadTrack(0);
            }
        } catch (error) {
            console.error('Error processing files:', error);
            this.showToast('เกิดข้อผิดพลาดในการประมวลผลไฟล์', 'error');
        }
    }

    async addStreamingTrack(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const track = {
                    id: Date.now() + Math.random(),
                    title: this.extractFileName(file.name),
                    artist: 'Unknown Artist',
                    duration: 0,
                    url: e.target.result,
                    size: file.size,
                    type: file.type,
                    addedAt: new Date().toISOString()
                };
                
                this.getAudioMetadata(track).then(() => {
                    this.streamingPlaylist.push(track);
                    resolve(track);
                }).catch(() => {
                    this.streamingPlaylist.push(track);
                    resolve(track);
                });
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    async getAudioMetadata(track) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(track.url);
            
            audio.addEventListener('loadedmetadata', () => {
                track.duration = audio.duration;
                resolve();
            });
            
            audio.addEventListener('error', () => {
                reject(new Error('Failed to load metadata'));
            });
            
            setTimeout(() => {
                reject(new Error('Metadata loading timeout'));
            }, 5000);
        });
    }

    extractFileName(filename) {
        return filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
    }

    // Player functionality
    showMusicPlayer() {
        if (this.musicPlayer) {
            this.musicPlayer.classList.add('show');
            // Add margin bottom to prevent overlap
            document.body.style.paddingBottom = '100px';
        }
    }

    hideMusicPlayer() {
        if (this.musicPlayer) {
            this.musicPlayer.classList.remove('show');
            document.body.style.paddingBottom = '0';
        }
    }

    loadTrack(index) {
        if (index < 0 || index >= this.streamingPlaylist.length) return;
        
        this.currentTrackIndex = index;
        const track = this.streamingPlaylist[index];
        
        if (this.audioPlayer) {
            this.audioPlayer.src = track.url;
        }
        if (this.playerTitle) {
            this.playerTitle.textContent = track.title;
        }
        if (this.playerArtist) {
            this.playerArtist.textContent = track.artist;
        }
        
        this.updatePlaylistActive();
        
        // Reset progress
        if (this.playerProgressSlider) {
            this.playerProgressSlider.value = 0;
        }
        if (this.playerProgress) {
            this.playerProgress.style.width = '0%';
        }
        if (this.playerCurrentTime) {
            this.playerCurrentTime.textContent = '0:00';
        }
    }

    togglePlayPause() {
        if (this.streamingPlaylist.length === 0) {
            this.showToast('กรุณาเพิ่มเพลงก่อน', 'error');
            return;
        }

        if (this.isPlaying) {
            this.audioPlayer.pause();
            this.playerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            this.isPlaying = false;
            this.updatePlaylistPlaying(false);
        } else {
            this.audioPlayer.play().then(() => {
                this.playerPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
                this.isPlaying = true;
                this.updatePlaylistPlaying(true);
            }).catch((error) => {
                console.error('Error playing audio:', error);
                this.showToast('ไม่สามารถเล่นเพลงนี้ได้', 'error');
            });
        }
    }

    previousTrack() {
        let newIndex = this.currentTrackIndex - 1;
        if (newIndex < 0) {
            newIndex = this.streamingPlaylist.length - 1;
        }
        this.loadTrack(newIndex);
        if (this.isPlaying) {
            this.audioPlayer.play();
        }
    }

    nextTrack() {
        let newIndex;
        
        if (this.isShuffle) {
            do {
                newIndex = Math.floor(Math.random() * this.streamingPlaylist.length);
            } while (newIndex === this.currentTrackIndex && this.streamingPlaylist.length > 1);
        } else {
            newIndex = this.currentTrackIndex + 1;
            if (newIndex >= this.streamingPlaylist.length) {
                newIndex = 0;
            }
        }
        
        this.loadTrack(newIndex);
        if (this.isPlaying) {
            this.audioPlayer.play();
        }
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        if (this.shuffleBtn) {
            this.shuffleBtn.classList.toggle('bg-purple-100', this.isShuffle);
            this.shuffleBtn.classList.toggle('text-purple-600', this.isShuffle);
        }
        this.showToast(this.isShuffle ? 'เปิดการสุ่มเพลง' : 'ปิดการสุ่มเพลง', 'success');
    }

    handleTrackEnd() {
        if (this.repeatMode === 'one') {
            this.audioPlayer.currentTime = 0;
            this.audioPlayer.play();
        } else if (this.repeatMode === 'all' || this.currentTrackIndex < this.streamingPlaylist.length - 1) {
            this.nextTrack();
        } else {
            this.playerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            this.isPlaying = false;
            this.updatePlaylistPlaying(false);
        }
    }

    updateProgress() {
        if (this.audioPlayer && this.audioPlayer.duration) {
            const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            if (this.playerProgressSlider) {
                this.playerProgressSlider.value = progress;
            }
            if (this.playerProgress) {
                this.playerProgress.style.width = progress + '%';
            }
            if (this.playerCurrentTime) {
                this.playerCurrentTime.textContent = this.formatTime(this.audioPlayer.currentTime);
            }
        }
    }

    updateDuration() {
        if (this.audioPlayer && this.audioPlayer.duration && this.playerTotalTime) {
            this.playerTotalTime.textContent = this.formatTime(this.audioPlayer.duration);
        }
    }

    seekTo() {
        if (this.audioPlayer && this.audioPlayer.duration && this.playerProgressSlider) {
            const seekTime = (this.playerProgressSlider.value / 100) * this.audioPlayer.duration;
            this.audioPlayer.currentTime = seekTime;
        }
    }

    setVolume() {
        if (this.audioPlayer && this.playerVolumeSlider) {
            const volume = this.playerVolumeSlider.value / 100;
            this.audioPlayer.volume = volume;
        }
    }

    // Playlist display methods
    updatePlaylistDisplay() {
        if (!this.streamingPlaylist || !this.streamingPlaylist) return;
        
        if (this.streamingPlaylist.length === 0) {
            this.streamingPlaylist.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-music-slash text-4xl mb-4"></i>
                    <p class="text-lg">ยังไม่มีเพลงใน Playlist</p>
                    <p class="text-sm">อัปโหลดเพลงเพื่อเริ่มฟัง</p>
                </div>
            `;
            this.hideMusicPlayer();
            return;
        }

        this.streamingPlaylist.innerHTML = this.streamingPlaylist.map((track, index) => `
            <div class="playlist-item flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${index === this.currentTrackIndex ? 'border-l-4 border-purple-500' : ''}" 
                 onclick="app.playTrack(${index})">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <i class="fas fa-music text-purple-600"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-800 truncate">${track.title}</h4>
                    <p class="text-sm text-gray-600 truncate">${track.artist}</p>
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-500">${this.formatTime(track.duration)}</p>
                    <button onclick="event.stopPropagation(); app.removeStreamingTrack(${index})" 
                            class="text-red-500 hover:text-red-700 mt-1">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        this.updatePlaylistActive();
    }

    updatePlaylistActive() {
        const playlistItems = document.querySelectorAll('#streamingPlaylist .playlist-item');
        playlistItems.forEach((item, index) => {
            if (index === this.currentTrackIndex) {
                item.classList.add('border-l-4', 'border-purple-500');
            } else {
                item.classList.remove('border-l-4', 'border-purple-500');
            }
        });
    }

    updatePlaylistPlaying(isPlaying) {
        const playlistItems = document.querySelectorAll('#streamingPlaylist .playlist-item');
        playlistItems.forEach((item, index) => {
            if (index === this.currentTrackIndex && isPlaying) {
                item.classList.add('bg-purple-50');
                const musicIcon = item.querySelector('.fa-music');
                if (musicIcon) {
                    musicIcon.className = 'fas fa-play text-purple-600';
                }
            } else {
                item.classList.remove('bg-purple-50');
                const playIcon = item.querySelector('.fa-play');
                if (playIcon) {
                    playIcon.className = 'fas fa-music text-purple-600';
                }
            }
        });
    }

    playTrack(index) {
        this.loadTrack(index);
        this.audioPlayer.play().then(() => {
            this.playerPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
            this.isPlaying = true;
            this.updatePlaylistPlaying(true);
        }).catch((error) => {
            console.error('Error playing track:', error);
            this.showToast('ไม่สามารถเล่นเพลงนี้ได้', 'error');
        });
    }

    removeStreamingTrack(index) {
        if (index < 0 || index >= this.streamingPlaylist.length) return;
        
        this.streamingPlaylist.splice(index, 1);
        
        if (index < this.currentTrackIndex) {
            this.currentTrackIndex--;
        } else if (index === this.currentTrackIndex) {
            if (this.currentTrackIndex >= this.streamingPlaylist.length) {
                this.currentTrackIndex = this.streamingPlaylist.length - 1;
            }
            if (this.streamingPlaylist.length > 0) {
                this.loadTrack(this.currentTrackIndex);
            } else {
                this.hideMusicPlayer();
                this.audioPlayer.src = '';
                this.isPlaying = false;
            }
        }
        
        this.saveStreamingPlaylist();
        this.updatePlaylistDisplay();
        this.showToast('ลบเพลงเรียบร้อยแล้ว', 'success');
    }

    clearStreamingPlaylist() {
        if (this.streamingPlaylist.length === 0) {
            this.showToast('ไม่มีเพลงให้ลบ', 'error');
            return;
        }
        
        if (confirm('คุณต้องการลบเพลงทั้งหมดหรือไม่?')) {
            this.streamingPlaylist = [];
            this.currentTrackIndex = 0;
            this.isPlaying = false;
            this.audioPlayer.src = '';
            this.playerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            this.hideMusicPlayer();
            
            this.saveStreamingPlaylist();
            this.updatePlaylistDisplay();
            this.showToast('ลบเพลงทั้งหมดเรียบร้อยแล้ว', 'success');
        }
    }

    // Search functionality
    handleStreamingSearch() {
        const query = this.streamingSearchInput.value.toLowerCase().trim();
        // Implement search logic here if needed
    }

    clearStreamingSearch() {
        if (this.streamingSearchInput) {
            this.streamingSearchInput.value = '';
        }
    }

    // Storage methods
    saveStreamingPlaylist() {
        try {
            localStorage.setItem('streamingPlaylist', JSON.stringify(this.streamingPlaylist));
        } catch (error) {
            console.error('Error saving playlist:', error);
        }
    }

    loadStreamingPlaylist() {
        try {
            const savedPlaylist = localStorage.getItem('streamingPlaylist');
            if (savedPlaylist) {
                this.streamingPlaylist = JSON.parse(savedPlaylist);
                if (this.streamingPlaylist.length > 0) {
                    this.showMusicPlayer();
                    this.loadTrack(0);
                }
            }
        } catch (error) {
            console.error('Error loading playlist:', error);
        }
    }

    // Distribution upload functionality
    setupDistributionDragAndDrop() {
        // Setup drag and drop for distribution upload (step 2)
        const audioDropZone = document.getElementById('audio-drop-zone');
        const coverDropZone = document.getElementById('cover-drop-zone');
        const audioInput = document.getElementById('song');
        const coverInput = document.getElementById('cover');
        
        if (audioDropZone && audioInput) {
            audioDropZone.addEventListener('click', () => audioInput.click());
            this.setupDropZone(audioDropZone, audioInput, 'audio');
        }
        
        if (coverDropZone && coverInput) {
            coverDropZone.addEventListener('click', () => coverInput.click());
            this.setupDropZone(coverDropZone, coverInput, 'image');
        }
    }

    setupDropZone(dropZone, input, fileType) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                const isValidFile = fileType === 'audio' ? 
                    file.type.startsWith('audio/') : 
                    file.type.startsWith('image/');
                    
                if (isValidFile) {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    input.files = dt.files;
                    input.dispatchEvent(new Event('change'));
                } else {
                    this.showToast(`กรุณาเลือกไฟล์${fileType === 'audio' ? 'เสียง' : 'รูปภาพ'}ที่รองรับ`, 'error');
                }
            }
        });
    }

    setupDistributionFileHandlers() {
        const audioInput = document.getElementById('song');
        const coverInput = document.getElementById('cover');
        
        if (audioInput) {
            audioInput.addEventListener('change', () => this.handleAudioFileChange());
        }
        
        if (coverInput) {
            coverInput.addEventListener('change', () => this.handleCoverFileChange());
        }
    }

    handleAudioFileChange() {
        const audioInput = document.getElementById('song');
        const audioFileName = document.getElementById('audioFileName');
        const audioFileSize = document.getElementById('audioFileSize');
        
        if (audioInput && audioInput.files.length > 0) {
            const file = audioInput.files[0];
            if (audioFileName) {
                audioFileName.textContent = `📁 ${file.name}`;
                audioFileName.classList.add('text-green-600');
            }
            if (audioFileSize) {
                audioFileSize.textContent = `ขนาดไฟล์: ${this.formatFileSize(file.size)}`;
                audioFileSize.classList.add('text-green-500');
            }
        }
    }

    handleCoverFileChange() {
        const coverInput = document.getElementById('cover');
        const coverFileName = document.getElementById('coverFileName');
        const coverFileSize = document.getElementById('coverFileSize');
        const coverPreview = document.getElementById('coverPreview');
        
        if (coverInput && coverInput.files.length > 0) {
            const file = coverInput.files[0];
            if (coverFileName) {
                coverFileName.textContent = `🖼️ ${file.name}`;
                coverFileName.classList.add('text-green-600');
            }
            if (coverFileSize) {
                coverFileSize.textContent = `ขนาดไฟล์: ${this.formatFileSize(file.size)}`;
                coverFileSize.classList.add('text-green-500');
            }
            
            if (coverPreview) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    coverPreview.src = e.target.result;
                    coverPreview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        }
    }

    // Distribution step navigation
    updateStepCircles() {
        const steps = document.querySelectorAll('.step');
        
        steps.forEach((step, index) => {
            const circle = step.querySelector('div');
            const stepNum = index + 1;
            
            if (stepNum < this.currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
                if (circle) {
                    circle.className = 'w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3';
                    circle.textContent = '✓';
                }
            } else if (stepNum === this.currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
                if (circle) {
                    circle.className = 'w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3';
                    circle.textContent = stepNum;
                }
            } else {
                step.classList.remove('active', 'completed');
                if (circle) {
                    circle.className = 'w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold mr-3';
                    circle.textContent = stepNum;
                }
            }
        });
    }

    // Song status search
    async handleSongStatusSearch(e) {
        e.preventDefault();
        const query = document.getElementById('statusSearchInput').value.trim();
        if (!query) {
            this.showToast('กรุณากรอกชื่อเพลงหรือศิลปิน', 'error');
            return;
        }
        
        const resultDiv = document.getElementById('song-status-result');
        const tableBody = document.getElementById('song-status-table-body');
        
        if (resultDiv) resultDiv.classList.remove('hidden');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="8" class="text-center p-4">กำลังค้นหา...</td></tr>';
        
        // Simulate API call with mock data
        setTimeout(() => {
            const mockData = [
                { id: '5063785164485', name: 'อีกกี่วันจะได้พบเธอ', artist: 'MPLGPatong2007', lyrics: 'ผู้ใช้', melody: 'ผู้ใช้', arrangement: 'ทีมงาน', note: '', status: 'approved' },
                { id: '5063785164486', name: 'เพลงรักเรา', artist: 'ศิลปิน A', lyrics: 'A', melody: 'A', arrangement: 'A', note: '', status: 'pending' },
                { id: '5063785164487', name: 'เพลงเศร้า', artist: 'ศิลปิน B', lyrics: 'B', melody: 'B', arrangement: 'B', note: 'มีปัญหาไฟล์', status: 'rejected' }
            ];
            
            const results = mockData.filter(item => 
                item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.artist.toLowerCase().includes(query.toLowerCase())
            );
            
            if (results.length === 0) {
                if (tableBody) tableBody.innerHTML = '<tr><td colspan="8" class="text-center p-4 text-red-500">ไม่พบข้อมูลเพลง</td></tr>';
                return;
            }
            
            let rowsHTML = '';
            results.forEach(item => {
                let statusClass = '';
                let statusEmoji = '';
                if (item.status === 'approved') { statusClass = 'status-approved'; statusEmoji = '✅'; }
                else if (item.status === 'pending') { statusClass = 'status-pending'; statusEmoji = '⏳'; }
                else if (item.status === 'rejected') { statusClass = 'status-rejected'; statusEmoji = '❌'; }
                
                rowsHTML += `
                    <tr>
                        <td>${item.id}</td>
                        <td>${item.name}</td>
                        <td>${item.artist}</td>
                        <td>${item.lyrics}</td>
                        <td>${item.melody}</td>
                        <td>${item.arrangement}</td>
                        <td>${item.note}</td>
                        <td class="${statusClass}">${statusEmoji} ${item.status}</td>
                    </tr>
                `;
            });
            if (tableBody) tableBody.innerHTML = rowsHTML;
        }, 1000);
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
        
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.previousTrack();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextTrack();
                break;
        }
    }

    // Utility methods
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 transition-all duration-300`;
        
        switch (type) {
            case 'success':
                toast.classList.add('bg-green-500');
                break;
            case 'error':
                toast.classList.add('bg-red-500');
                break;
            default:
                toast.classList.add('bg-blue-500');
        }
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('opacity-0', 'transform', 'translate-x-full');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Page navigation functions
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(page => {
        page.classList.remove('active');
    });
    
    document.getElementById(pageId + '-page').classList.add('active');
    window.scrollTo(0, 0);
}

// Distribution form functions
function nextStep() {
    if (app.currentStep < app.totalSteps) {
        document.getElementById(`step${app.currentStep}`).classList.add('hidden');
        app.currentStep++;
        document.getElementById(`step${app.currentStep}`).classList.remove('hidden');
        
        const progress = ((app.currentStep - 1) / (app.totalSteps - 1)) * 100;
        document.querySelector('.progress-bar').style.width = `${progress}%`;
        
        app.updateStepCircles();
        
        if (app.currentStep === 4) {
            updateSummary();
        }
    }
}

function prevStep() {
    if (app.currentStep > 1) {
        document.getElementById(`step${app.currentStep}`).classList.add('hidden');
        app.currentStep--;
        document.getElementById(`step${app.currentStep}`).classList.remove('hidden');
        
        const progress = ((app.currentStep - 1) / (app.totalSteps - 1)) * 100;
        document.querySelector('.progress-bar').style.width = `${progress}%`;
        
        app.updateStepCircles();
    }
}

function updateSummary() {
    const elements = {
        'summaryArtist': 'artistName',
        'summarySong': 'songName',
        'summaryGenre': 'genre',
        'summaryDate': 'releaseDate',
        'summaryComposer': 'composer',
        'summaryLyricist': 'lyricist'
    };
    
    Object.keys(elements).forEach(summaryId => {
        const element = document.getElementById(summaryId);
        const inputElement = document.getElementById(elements[summaryId]);
        if (element && inputElement) {
            element.textContent = inputElement.value || '-';
        }
    });
}

function checkOAC() {
    const link = document.getElementById('youtubeLink').value;
    const subs = document.getElementById('subscribers').value;
    
    if (!link || subs < 0) {
        app.showToast('กรุณากรอกข้อมูลให้ถูกต้อง', 'error');
        return false;
    }
    
    app.showToast('ส่งคำขอ OAC เรียบร้อย!', 'success');
    return false;
}

function submitForm() {
    app.showToast('ส่งข้อมูลและอัปโหลดเพลงเรียบร้อย!', 'success');
    
    // Reset form
    const formIds = ['artistName', 'songName', 'albumName', 'genre', 'language', 'releaseDate', 'composer', 'lyricist', 'producer', 'studio', 'description', 'youtubeLink', 'subscribers'];
    formIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    // Reset file inputs
    const fileInputs = ['song', 'cover'];
    fileInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    // Reset file displays
    const fileDisplays = ['audioFileName', 'audioFileSize', 'coverFileName', 'coverFileSize'];
    fileDisplays.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = '';
            element.classList.remove('text-green-600', 'text-green-500');
        }
    });
    
    const coverPreview = document.getElementById('coverPreview');
    if (coverPreview) {
        coverPreview.classList.add('hidden');
        coverPreview.src = '';
    }
    
    // Reset to first step
    document.getElementById(`step${app.currentStep}`).classList.add('hidden');
    app.currentStep = 1;
    document.getElementById('step1').classList.remove('hidden');
    document.querySelector('.progress-bar').style.width = '0%';
    app.updateStepCircles();
}

function toggleFAQ(element) {
    const content = element.nextElementSibling;
    const icon = element.querySelector('span.float-right');
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.textContent = '-';
    } else {
        content.classList.add('hidden');
        icon.textContent = '+';
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CombinedMusicApp();
    console.log('🎵 Combined Music Distribution & Streaming App initialized!');
});

// Save data on page unload
window.addEventListener('beforeunload', () => {
    if (app) {
        app.saveStreamingPlaylist();
    }
});