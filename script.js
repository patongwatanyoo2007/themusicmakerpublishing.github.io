// Initialize variables
let currentStep = 1;
const totalSteps = 4;

// Page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-section').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId + '-page').classList.add('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// File upload handlers
document.addEventListener('DOMContentLoaded', function() {
    // แสดงชื่อไฟล์เพลงทันที
    const audioInput = document.getElementById('song');
    const audioFileName = document.getElementById('audioFileName');
    
    if (audioInput) {
        audioInput.addEventListener('change', () => {
            if (audioInput.files.length > 0) {
                audioFileName.textContent = `ไฟล์ที่เลือก: ${audioInput.files[0].name}`;
            } else {
                audioFileName.textContent = '';
            }
        });
    }
    
    // แสดงชื่อไฟล์และ preview รูปปกทันที
    const coverInput = document.getElementById('cover');
    const coverFileName = document.getElementById('coverFileName');
    const coverPreview = document.getElementById('coverPreview');
    
    if (coverInput) {
        coverInput.addEventListener('change', () => {
            if (coverInput.files.length > 0) {
                coverFileName.textContent = `ไฟล์ที่เลือก: ${coverInput.files[0].name}`;
                const reader = new FileReader();
                reader.onload = (e) => {
                    coverPreview.src = e.target.result;
                    coverPreview.classList.remove('hidden');
                }
                reader.readAsDataURL(coverInput.files[0]);
            } else {
                coverFileName.textContent = '';
                coverPreview.src = '';
                coverPreview.classList.add('hidden');
            }
        });
    }
    
    // Initialize step circles
    updateStepCircles();
    
    // Song status form
    const songStatusForm = document.getElementById('song-status-form');
    if (songStatusForm) {
        songStatusForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = document.getElementById('searchInput').value.trim();
            if(!query) {
                alert("กรุณากรอกชื่อเพลงหรือศิลปิน");
                return;
            }
            
            // Show loading state
            const resultDiv = document.getElementById('song-status-result');
            const tableBody = document.getElementById('song-status-table-body');
            resultDiv.classList.remove('hidden');
            tableBody.innerHTML = `<tr><td colspan="8" class="text-center p-4">กำลังค้นหา...</td></tr>`;
            
            // Simulate API call
            setTimeout(() => {
                // Mock data - replace with actual API call
                const mockData = [
                    { id: '5063785164485', name: 'อีกกี่วันจะได้พบเธอ', artist: 'MPLGPatong2007', lyrics: 'ผู้ใช้', melody: 'ผู้ใช้', arrangement: 'ทีมงาน', note: '', status: 'approved' },
                    { id: '5063785164486', name: 'เพลงรักเรา', artist: 'ศิลปิน A', lyrics: 'A', melody: 'A', arrangement: 'A', note: '', status: 'pending' },
                    { id: '5063785164487', name: 'เพลงเศร้า', artist: 'ศิลปิน B', lyrics: 'B', melody: 'B', arrangement: 'B', note: 'มีปัญหาไฟล์', status: 'rejected' }
                ];
                
                // Filter by query (name or artist)
                const results = mockData.filter(item => 
                    item.name.toLowerCase().includes(query.toLowerCase()) ||
                    item.artist.toLowerCase().includes(query.toLowerCase())
                );
                
                if(results.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="8" class="text-center p-4 text-red-500">ไม่พบข้อมูลเพลง</td></tr>`;
                    return;
                }
                
                // Build table rows with emoji icons
                let rowsHTML = '';
                results.forEach(item => {
                    let statusClass = '';
                    let statusEmoji = '';
                    if(item.status === 'approved') { statusClass = 'status-approved'; statusEmoji = '✅'; }
                    else if(item.status === 'pending') { statusClass = 'status-pending'; statusEmoji = '⏳'; }
                    else if(item.status === 'rejected') { statusClass = 'status-rejected'; statusEmoji = '❌'; }
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
                tableBody.innerHTML = rowsHTML;
            }, 1000);
        });
    }
});

// Step navigation functions
function nextStep() {
    if (currentStep < totalSteps) {
        document.getElementById(`step${currentStep}`).classList.add('hidden');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.remove('hidden');
        
        // Update progress bar
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        document.querySelector('.progress-bar').style.width = `${progress}%`;
        
        // Update step indicators
        updateStepCircles();
        
        // Update summary if on last step
        if (currentStep === 4) {
            updateSummary();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).classList.add('hidden');
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.remove('hidden');
        
        // Update progress bar
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        document.querySelector('.progress-bar').style.width = `${progress}%`;
        
        // Update step indicators
        updateStepCircles();
    }
}

function updateStepCircles() {
    const steps = document.querySelectorAll('.step');
    
    steps.forEach((step, index) => {
        const circle = step.querySelector('div');
        const stepNum = index + 1;
        
        if (stepNum < currentStep) {
            // Completed step
            step.classList.add('completed');
            step.classList.remove('active');
            circle.className = 'w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3';
            circle.textContent = '✓';
        } else if (stepNum === currentStep) {
            // Active step
            step.classList.add('active');
            step.classList.remove('completed');
            circle.className = 'w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3';
            circle.textContent = stepNum;
        } else {
            // Future step
            step.classList.remove('active', 'completed');
            circle.className = 'w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold mr-3';
            circle.textContent = stepNum;
        }
    });
}

function updateSummary() {
    document.getElementById('summaryArtist').textContent = document.getElementById('artistName').value || '-';
    document.getElementById('summarySong').textContent = document.getElementById('songName').value || '-';
    document.getElementById('summaryGenre').textContent = document.getElementById('genre').value || '-';
    document.getElementById('summaryDate').textContent = document.getElementById('releaseDate').value || '-';
}

function checkOAC() {
    const link = document.getElementById('youtubeLink').value;
    const subs = document.getElementById('subscribers').value;
    
    if (!link || subs < 0) {
        alert("กรุณากรอกข้อมูลให้ถูกต้อง");
        return false;
    }
    
    alert("ส่งคำขอ OAC เรียบร้อย!");
    return false;
}

function submitForm() {
    alert("ส่งข้อมูลและอัปโหลดเพลงเรียบร้อย!");
    
    // Reset form and go back to first step
    document.getElementById('artistName').value = '';
    document.getElementById('songName').value = '';
    document.getElementById('albumName').value = '';
    document.getElementById('genre').value = '';
    document.getElementById('language').value = '';
    document.getElementById('releaseDate').value = '';
    document.getElementById('composer').value = '';
    document.getElementById('lyricist').value = '';
    document.getElementById('producer').value = '';
    document.getElementById('studio').value = '';
    document.getElementById('description').value = '';
    document.getElementById('youtubeLink').value = '';
    document.getElementById('subscribers').value = '';
    document.getElementById('song').value = '';
    document.getElementById('cover').value = '';
    document.getElementById('audioFileName').textContent = '';
    document.getElementById('coverFileName').textContent = '';
    document.getElementById('coverPreview').classList.add('hidden');
    
    // Go back to first step
    document.getElementById(`step${currentStep}`).classList.add('hidden');
    currentStep = 1;
    document.getElementById('step1').classList.remove('hidden');
    document.querySelector('.progress-bar').style.width = '0%';
    updateStepCircles();
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// FAQ toggle function
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

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
