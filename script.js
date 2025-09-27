class MusicStreamingApp {
    constructor() {
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.isShuffle = false;
        this.repeatMode = 'none'; // none, one, all
        this.originalPlaylist = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadPlaylistFromStorage();
        this.updatePlaylistDisplay();
    }

    initializeElements() {
        // Upload elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        
        // Search elements
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchBtn = document.getElementById('clearSearch');
        
        // Player elements
        this.playerSection = document.getElementById('playerSection');
        this.audioPlayer = document.getElementById('audioPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        
        // Progress elements
        this.progressSlider = document.getElementById('progressSlider');
        this.progress = document.getElementById('progress');
        this.currentTimeSpan = document.getElementById('currentTime');
        this.totalTimeSpan = document.getElementById('totalTime');
        
        // Volume elements
        this.volumeSlider = document.getElementById('volumeSlider');
        
        // Display elements
        this.currentTitle = document.getElementById('currentTitle');
        this.currentArtist = document.getElementById('currentArtist');
        this.playerArtwork = document.getElementById('playerArtwork');
        
        // Playlist elements
        this.playlistContainer = document.getElementById('playlist');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.exportBtn = document.getElementById('exportBtn');
        
        // Modal elements
        this.loadingModal = document.getElementById('loadingModal');
        this.toastContainer = document.getElementById('toastContainer');
    }

    setupEventListeners() {
        // Upload events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Search events
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.clearSearchBtn.addEventListener('click', () => this.clearSearch());
        
        // Player control events
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        
        // Audio events
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audioPlayer.addEventListener('ended', () => this.handleTrackEnd());
        this.audioPlayer.addEventListener('error', (e) => this.handleAudioError(e));
        
        // Progress slider events
        this.progressSlider.addEventListener('input', () => this.seekTo());
        
        // Volume slider events
        this.volumeSlider.addEventListener('input', () => this.setVolume());
        
        // Playlist control events
        this.clearAllBtn.addEventListener('click', () => this.clearAllTracks());
        this.exportBtn.addEventListener('click', () => this.exportPlaylist());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Initialize volume
        this.setVolume();
    }

    // File handling methods
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.processFiles(files);
    }

    handleDragOver(event) {
        event.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
        const files = Array.from(event.dataTransfer.files);
        this.processFiles(files);
    }

    async processFiles(files) {
        const audioFiles = files.filter(file => file.type.startsWith('audio/'));
        
        if (audioFiles.length === 0) {
            this.showToast('กรุณาเลือกไฟล์เสียงที่รองรับ', 'error');
            return;
        }

        if (audioFiles.some(file => file.size > 50 * 1024 * 1024)) {
            this.showToast('ขนาดไฟล์ต้องไม่เกิน 50MB', 'error');
            return;
        }

        this.showLoading(true);

        try {
            for (const file of audioFiles) {
                await this.addTrackToPlaylist(file);
            }
            
            this.savePlaylistToStorage();
            this.updatePlaylistDisplay();
            this.showToast(`เพิ่มเพลง ${audioFiles.length} เพลงเรียบร้อยแล้ว`, 'success');
            
            // Show player if first tracks
            if (this.playlist.length === audioFiles.length) {
                this.showPlayer();
                this.loadTrack(0);
            }
        } catch (error) {
            console.error('Error processing files:', error);
            this.showToast('เกิดข้อผิดพลาดในการประมวลผลไฟล์', 'error');
        } finally {
            this.showLoading(false);
            this.fileInput.value = '';
        }
    }

    async addTrackToPlaylist(file) {
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
                
                // Try to get metadata
                this.getAudioMetadata(track).then(() => {
                    this.playlist.push(track);
                    this.originalPlaylist.push(track);
                    resolve(track);
                }).catch(() => {
                    this.playlist.push(track);
                    this.originalPlaylist.push(track);
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
            
            // Set timeout to prevent hanging
            setTimeout(() => {
                reject(new Error('Metadata loading timeout'));
            }, 5000);
        });
    }

    extractFileName(filename) {
        return filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
    }

    // Search functionality
    handleSearch() {
        const query = this.searchInput.value.toLowerCase().trim();
        
        if (!query) {
            this.updatePlaylistDisplay(this.originalPlaylist);
            return;
        }
        
        const filteredTracks = this.originalPlaylist.filter(track => 
            track.title.toLowerCase().includes(query) || 
            track.artist.toLowerCase().includes(query)
        );
        
        this.updatePlaylistDisplay(filteredTracks);
    }

    clearSearch() {
        this.searchInput.value = '';
        this.updatePlaylistDisplay();
    }

    // Player control methods
    showPlayer() {
        this.playerSection.style.display = 'block';
    }

    loadTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;
        
        this.currentTrackIndex = index;
        const track = this.playlist[index];
        
        this.audioPlayer.src = track.url;
        this.currentTitle.textContent = track.title;
        this.currentArtist.textContent = track.artist;
        
        // Update playlist active state
        this.updatePlaylistActive();
        
        // Reset progress
        this.progressSlider.value = 0;
        this.progress.style.width = '0%';
        this.currentTimeSpan.textContent = '0:00';
    }

    togglePlayPause() {
        if (this.playlist.length === 0) {
            this.showToast('กรุณาเพิ่มเพลงก่อน', 'error');
            return;
        }

        if (this.isPlaying) {
            this.audioPlayer.pause();
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            this.isPlaying = false;
            this.updatePlaylistPlaying(false);
        } else {
            this.audioPlayer.play().then(() => {
                this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
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
            newIndex = this.playlist.length - 1;
        }
        this.loadTrack(newIndex);
        if (this.isPlaying) {
            this.audioPlayer.play();
        }
    }

    nextTrack() {
        let newIndex;
        
        if (this.isShuffle) {
            // Random track (but not current)
            do {
                newIndex = Math.floor(Math.random() * this.playlist.length);
            } while (newIndex === this.currentTrackIndex && this.playlist.length > 1);
        } else {
            newIndex = this.currentTrackIndex + 1;
            if (newIndex >= this.playlist.length) {
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
        this.shuffleBtn.classList.toggle('active', this.isShuffle);
        this.showToast(this.isShuffle ? 'เปิดการสุ่มเพลง' : 'ปิดการสุ่มเพลง', 'success');
    }

    toggleRepeat() {
        const modes = ['none', 'one', 'all'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        
        this.repeatBtn.classList.toggle('active', this.repeatMode !== 'none');
        
        const messages = {
            'none': 'ปิดการทำซ้ำ',
            'one': 'ทำซ้ำเพลงนี้',
            'all': 'ทำซ้ำทั้งหมด'
        };
        
        this.showToast(messages[this.repeatMode], 'success');
    }

    handleTrackEnd() {
        if (this.repeatMode === 'one') {
            this.audioPlayer.currentTime = 0;
            this.audioPlayer.play();
        } else if (this.repeatMode === 'all' || this.currentTrackIndex < this.playlist.length - 1) {
            this.nextTrack();
        } else {
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            this.isPlaying = false;
            this.updatePlaylistPlaying(false);
        }
    }

    handleAudioError(event) {
        console.error('Audio error:', event);
        this.showToast('เกิดข้อผิดพลาดในการเล่นเพลง', 'error');
        this.isPlaying = false;
        this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }

    // Progress and volume methods
    updateProgress() {
        if (this.audioPlayer.duration) {
            const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            this.progressSlider.value = progress;
            this.progress.style.width = progress + '%';
            this.currentTimeSpan.textContent = this.formatTime(this.audioPlayer.currentTime);
        }
    }

    updateDuration() {
        if (this.audioPlayer.duration) {
            this.totalTimeSpan.textContent = this.formatTime(this.audioPlayer.duration);
        }
    }

    seekTo() {
        if (this.audioPlayer.duration) {
            const seekTime = (this.progressSlider.value / 100) * this.audioPlayer.duration;
            this.audioPlayer.currentTime = seekTime;
        }
    }

    setVolume() {
        const volume = this.volumeSlider.value / 100;
        this.audioPlayer.volume = volume;
        
        // Update volume icon
        const volumeIcon = this.volumeSlider.parentElement.querySelector('i');
        if (volume === 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (volume < 0.5) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    }

    // Playlist display methods
    updatePlaylistDisplay(tracks = null) {
        const displayTracks = tracks || this.playlist;
        
        if (displayTracks.length === 0) {
            this.playlistContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-music-slash"></i>
                    <p>${tracks ? 'ไม่พบเพลงที่ค้นหา' : 'ยังไม่มีเพลงใน Playlist'}</p>
                    <p class="small">${tracks ? 'ลองค้นหาด้วยคำอื่น' : 'อัปโหลดเพลงเพื่อเริ่มต้น'}</p>
                </div>
            `;
            return;
        }

        this.playlistContainer.innerHTML = displayTracks.map((track, index) => `
            <div class="playlist-item" data-index="${index}" data-id="${track.id}">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 24 24'%3E%3Cpath fill='%23ddd' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z'/%3E%3C/svg%3E" alt="Album Art" class="album-art">
                <div class="song-info">
                    <div class="song-title">${track.title}</div>
                    <div class="song-artist">${track.artist}</div>
                </div>
                <div class="song-duration">${this.formatTime(track.duration)}</div>
                <div class="song-controls">
                    <button onclick="app.playTrack(${this.playlist.findIndex(t => t.id === track.id)})" title="เล่น">
                        <i class="fas fa-play"></i>
                    </button>
                    <button onclick="app.removeTrack(${this.playlist.findIndex(t => t.id === track.id)})" title="ลบ">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        this.updatePlaylistActive();
    }

    updatePlaylistActive() {
        const playlistItems = document.querySelectorAll('.playlist-item');
        playlistItems.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentTrackIndex);
        });
    }

    updatePlaylistPlaying(isPlaying) {
        const playlistItems = document.querySelectorAll('.playlist-item');
        playlistItems.forEach((item, index) => {
            item.classList.toggle('playing', index === this.currentTrackIndex && isPlaying);
        });
    }

    playTrack(index) {
        this.loadTrack(index);
        this.audioPlayer.play().then(() => {
            this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            this.isPlaying = true;
            this.updatePlaylistPlaying(true);
        }).catch((error) => {
            console.error('Error playing track:', error);
            this.showToast('ไม่สามารถเล่นเพลงนี้ได้', 'error');
        });
    }

    removeTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;
        
        const track = this.playlist[index];
        
        // Remove from both playlists
        this.playlist.splice(index, 1);
        const originalIndex = this.originalPlaylist.findIndex(t => t.id === track.id);
        if (originalIndex !== -1) {
            this.originalPlaylist.splice(originalIndex, 1);
        }
        
        // Adjust current track index
        if (index < this.currentTrackIndex) {
            this.currentTrackIndex--;
        } else if (index === this.currentTrackIndex) {
            if (this.currentTrackIndex >= this.playlist.length) {
                this.currentTrackIndex = this.playlist.length - 1;
            }
            if (this.playlist.length > 0) {
                this.loadTrack(this.currentTrackIndex);
            } else {
                this.playerSection.style.display = 'none';
                this.audioPlayer.src = '';
                this.isPlaying = false;
            }
        }
        
        this.savePlaylistToStorage();
        this.updatePlaylistDisplay();
        this.showToast('ลบเพลงเรียบร้อยแล้ว', 'success');
    }

    clearAllTracks() {
        if (this.playlist.length === 0) {
            this.showToast('ไม่มีเพลงให้ลบ', 'error');
            return;
        }
        
        if (confirm('คุณต้องการลบเพลงทั้งหมดหรือไม่?')) {
            this.playlist = [];
            this.originalPlaylist = [];
            this.currentTrackIndex = 0;
            this.isPlaying = false;
            this.audioPlayer.src = '';
            this.playerSection.style.display = 'none';
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            
            this.savePlaylistToStorage();
            this.updatePlaylistDisplay();
            this.showToast('ลบเพลงทั้งหมดเรียบร้อยแล้ว', 'success');
        }
    }

    exportPlaylist() {
        if (this.playlist.length === 0) {
            this.showToast('ไม่มีเพลงให้ส่งออก', 'error');
            return;
        }
        
        const playlistData = {
            name: 'My Playlist',
            created: new Date().toISOString(),
            tracks: this.playlist.map(track => ({
                title: track.title,
                artist: track.artist,
                duration: track.duration,
                addedAt: track.addedAt
            }))
        };
        
        const dataStr = JSON.stringify(playlistData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `playlist_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showToast('ส่งออก Playlist เรียบร้อยแล้ว', 'success');
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(event) {
        // Only handle shortcuts if not typing in input fields
        if (event.target.tagName === 'INPUT') return;
        
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
            case 'KeyS':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.toggleShuffle();
                }
                break;
            case 'KeyR':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.toggleRepeat();
                }
                break;
        }
    }

    // Storage methods
    savePlaylistToStorage() {
        try {
            // Only save metadata, not the actual audio data
            const playlistToSave = this.originalPlaylist.map(track => ({
                id: track.id,
                title: track.title,
                artist: track.artist,
                duration: track.duration,
                size: track.size,
                type: track.type,
                addedAt: track.addedAt,
                url: track.url // Keep the data URL for now
            }));
            
            localStorage.setItem('musicStreamingPlaylist', JSON.stringify(playlistToSave));
        } catch (error) {
            console.error('Error saving playlist:', error);
            this.showToast('ไม่สามารถบันทึก Playlist ได้', 'error');
        }
    }

    loadPlaylistFromStorage() {
        try {
            const savedPlaylist = localStorage.getItem('musicStreamingPlaylist');
            if (savedPlaylist) {
                const parsedPlaylist = JSON.parse(savedPlaylist);
                this.playlist = parsedPlaylist;
                this.originalPlaylist = [...parsedPlaylist];
                
                if (this.playlist.length > 0) {
                    this.showPlayer();
                    this.loadTrack(0);
                }
            }
        } catch (error) {
            console.error('Error loading playlist:', error);
            this.showToast('ไม่สามารถโหลด Playlist ได้', 'error');
        }
    }

    // Utility methods
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    showLoading(show) {
        this.loadingModal.style.display = show ? 'flex' : 'none';
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.toastContainer.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 3000);
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MusicStreamingApp();
    console.log('🎵 Free Music Streaming App initialized!');
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (app) {
        app.savePlaylistToStorage();
    }
});