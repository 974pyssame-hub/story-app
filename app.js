// ==================== STATE MANAGEMENT ====================
const state = {
  stories: [],
  currentStory: null,
  currentView: 'library',
  fontSize: 100,
  wordGoal: 0,
  weeklyStats: [],
  isDarkMode: localStorage.getItem('darkMode') === 'true'
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  loadStoriesFromStorage();
  setupEventListeners();
  applyTheme();
  initializeCharts();
  loadSampleStories();
  render();
}

// ==================== SAMPLE STORIES ====================
function loadSampleStories() {
  if (state.stories.length === 0) {
    const sampleStories = [
      {
        id: Date.now() + 1,
        title: "Le Mystère de la Forêt Enchantée",
        content: "Il était une fois, dans une forêt lointaine et mystérieuse, un jeune aventurier nommé Marcus. Les vieux contes parlaient d'une forêt enchantée où la magie dansait entre les arbres centenaires.\n\nCe matin-là, Marcus franchit les portes vertes de la forêt, son cœur battant au rythme de l'inconnu. Les rayons du soleil perçaient à peine le feuillage dense, créant des ombres dansantes sur le sol couvert de mousse.\n\nAu fur et à mesure qu'il avançait, il remarqua des traces lumineuses, comme si les créatures magiques traçaient leur chemin. Des sons étranges retentissaient - pas tout à fait animaux, pas tout à fait humains. Une présence ancienne semblait regarder chaque pas du voyageur.\n\nEt puis, à travers le brouillard du matin, apparut une silhouette scintillante.",
        genre: "Fantasy",
        excerpt: "Un jeune aventurier pénètre dans une forêt enchantée où la magie danse entre les arbres centenaires...",
        wordCount: 185,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        tags: ["Aventure", "Magie"]
      },
      {
        id: Date.now() + 2,
        title: "En 2145, Les Étoiles se Rapprochent",
        content: "L'année 2145. L'humanité avait atteint les étoiles, ou du moins, elle le pensait. Les premières colonies sur Mars s'épanouissaient, les stations orbitales tournoyaient au-dessus de la Terre, et les voyages interstellaires n'étaient plus une fiction.\n\nMais le 15 novembre, quelque chose d'inattendu se produisit.\n\nLes télescopes détectèrent d'abord une anomalie - une structure géométrique de la taille d'une planète, se dirigeant vers le système solaire. Les gouvernements du monde entrèrent en session d'urgence.\n\nLa Docteure Alison Chen, directrice du Centre Spatial International, regardait l'écran holographique qui affichait l'objet. Ses collègues retenaient leur souffle.\n\n'C'est impossible', murmura Alison. 'Ce n'est pas un astéroïde. Ce n'est pas même naturel. Quelqu'un... ou quelque chose... nous rend visite.'",
        genre: "Science-Fiction",
        excerpt: "En 2145, une structure extraterrestre géante se dirige vers le système solaire, forçant l'humanité à faire face à l'inconnu...",
        wordCount: 220,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        tags: ["Futur", "Aliens"]
      }
    ];
    state.stories = sampleStories;
    saveStoriesToStorage();
  }
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = e.currentTarget.dataset.view;
      switchView(view);
    });
  });

  // Theme Toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Library
  document.getElementById('searchInput').addEventListener('input', filterStories);
  document.getElementById('genreFilter').addEventListener('change', filterStories);
  document.getElementById('sortBy').addEventListener('change', filterStories);

  // Editor
  document.getElementById('storyContent').addEventListener('input', updateEditorStats);
  document.getElementById('saveStory').addEventListener('click', saveStory);
  document.getElementById('exportStory').addEventListener('click', openExportModal);
  document.getElementById('newStory').addEventListener('click', createNewStory);

  // Reader
  document.getElementById('closeReader').addEventListener('click', () => switchView('library'));
  document.getElementById('fontSmall').addEventListener('click', () => changeFontSize(-10));
  document.getElementById('fontLarge').addEventListener('click', () => changeFontSize(10));

  // Stats
  document.getElementById('setGoal').addEventListener('click', setWordGoal);

  // Export Modal
  document.querySelectorAll('.export-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const format = e.currentTarget.dataset.format;
      exportStory(format);
    });
  });
  document.getElementById('copyToClipboard').addEventListener('click', copyToClipboard);
  document.querySelector('.btn-close').addEventListener('click', closeExportModal);
  document.getElementById('exportModal').addEventListener('click', (e) => {
    if (e.target.id === 'exportModal') closeExportModal();
  });
}

// ==================== VIEW SWITCHING ====================
function switchView(viewName) {
  state.currentView = viewName;
  
  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  // Hide all views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });

  // Show selected view
  const view = document.getElementById(viewName);
  if (view) {
    view.classList.add('active');
    if (viewName === 'stats') {
      setTimeout(() => updateChart(), 100);
    }
  }

  // Hide reader if switching away
  if (viewName !== 'reader') {
    document.getElementById('reader').classList.remove('active');
  }
}

// ==================== THEME ====================
function toggleTheme() {
  state.isDarkMode = !state.isDarkMode;
  localStorage.setItem('darkMode', state.isDarkMode);
  applyTheme();
}

function applyTheme() {
  if (state.isDarkMode) {
    document.body.classList.add('dark-mode');
    document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    document.body.classList.remove('dark-mode');
    document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
  }
}

// ==================== LIBRARY ====================
function filterStories() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const genreFilter = document.getElementById('genreFilter').value;
  const sortBy = document.getElementById('sortBy').value;

  let filtered = state.stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm) ||
                         story.excerpt.toLowerCase().includes(searchTerm) ||
                         (story.tags && story.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
    const matchesGenre = !genreFilter || story.genre === genreFilter;
    return matchesSearch && matchesGenre;
  });

  // Sort
  filtered.sort((a, b) => {
    switch(sortBy) {
      case 'date-desc':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'date-asc':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'length-desc':
        return b.wordCount - a.wordCount;
      case 'length-asc':
        return a.wordCount - b.wordCount;
      case 'title-asc':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  renderStories(filtered);
}

function renderStories(stories) {
  const grid = document.getElementById('storiesGrid');
  
  if (stories.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1;">
        <div class="empty-state">
          <i class="fas fa-book"></i>
          <p>Aucune histoire trouvée. Commencez à écrire!</p>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = stories.map(story => `
    <div class="story-card">
      <div class="story-card-header">
        <div class="story-card-genre genre-${story.genre.toLowerCase().replace(/[éèêë\s-]/g, '')}">
          ${story.genre}
        </div>
        <h3 class="story-card-title">${story.title}</h3>
        <p class="story-card-excerpt">${story.excerpt}</p>
      </div>
      <div class="story-card-meta">
        <span><i class="fas fa-calendar"></i> ${formatDate(story.createdAt)}</span>
        <span><i class="fas fa-clock"></i> ${Math.ceil(story.wordCount / 200)} min</span>
        <span><i class="fas fa-words"></i> ${story.wordCount} mots</span>
      </div>
      <div class="story-card-footer">
        <button class="read-btn" data-id="${story.id}">
          <i class="fas fa-book-open"></i> Lire
        </button>
        <button class="edit-btn" data-id="${story.id}">
          <i class="fas fa-edit"></i> Éditer
        </button>
        <button class="delete-btn" data-id="${story.id}">
          <i class="fas fa-trash"></i> Supprimer
        </button>
      </div>
    </div>
  `).join('');

  // Add event listeners
  document.querySelectorAll('.read-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      openReader(id);
    });
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      editStory(id);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      deleteStory(id);
    });
  });
}

// ==================== EDITOR ====================
function createNewStory() {
  state.currentStory = null;
  document.getElementById('storyTitle').value = '';
  document.getElementById('storyGenre').value = '';
  document.getElementById('storyContent').value = '';
  document.getElementById('wordCount').textContent = '0';
  document.getElementById('charCount').textContent = '0';
  document.getElementById('readTime').textContent = '0 min';
  document.getElementById('saveStory').innerHTML = '<i class="fas fa-save"></i> Sauvegarder';
  document.getElementById('exportStory').style.display = 'none';
  switchView('writer');
}

function editStory(id) {
  const story = state.stories.find(s => s.id === id);
  if (story) {
    state.currentStory = story;
    document.getElementById('storyTitle').value = story.title;
    document.getElementById('storyGenre').value = story.genre;
    document.getElementById('storyContent').value = story.content;
    document.getElementById('exportStory').style.display = 'block';
    updateEditorStats();
    switchView('writer');
  }
}

function updateEditorStats() {
  const content = document.getElementById('storyContent').value;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const readTime = Math.ceil(wordCount / 200);

  document.getElementById('wordCount').textContent = wordCount;
  document.getElementById('charCount').textContent = charCount;
  document.getElementById('readTime').textContent = readTime + ' min';
}

function saveStory() {
  const title = document.getElementById('storyTitle').value.trim();
  const genre = document.getElementById('storyGenre').value;
  const content = document.getElementById('storyContent').value.trim();

  if (!title || !genre || !content) {
    showToast('Veuillez remplir tous les champs', 'error');
    return;
  }

  const excerpt = content.substring(0, 150) + (content.length > 150 ? '...' : '');
  const wordCount = content.split(/\s+/).length;

  if (state.currentStory) {
    // Update existing
    state.currentStory.title = title;
    state.currentStory.genre = genre;
    state.currentStory.content = content;
    state.currentStory.excerpt = excerpt;
    state.currentStory.wordCount = wordCount;
  } else {
    // Create new
    state.stories.push({
      id: Date.now(),
      title,
      genre,
      content,
      excerpt,
      wordCount,
      createdAt: new Date(),
      tags: []
    });
  }

  saveStoriesToStorage();
  showToast('Histoire sauvegardée avec succès!');
  document.getElementById('saveStory').classList.add('saved');
  setTimeout(() => {
    document.getElementById('saveStory').classList.remove('saved');
  }, 2000);
}

// ==================== READER ====================
function openReader(id) {
  const story = state.stories.find(s => s.id === id);
  if (!story) return;

  state.currentStory = story;
  document.getElementById('readerTitle').textContent = story.title;
  document.getElementById('readerContent').innerHTML = `<p>${story.content.replace(/\n/g, '</p><p>')}</p>`;
  document.getElementById('readingTime').textContent = `Temps de lecture estimé: ${Math.ceil(story.wordCount / 200)} min`;
  document.getElementById('fontSizeDisplay').textContent = state.fontSize + '%';
  document.getElementById('readerContent').style.fontSize = (1.1 * state.fontSize / 100) + 'rem';
  
  switchView('reader');
  setupReadingProgress();
}

function changeFontSize(delta) {
  state.fontSize = Math.max(50, Math.min(200, state.fontSize + delta));
  document.getElementById('fontSizeDisplay').textContent = state.fontSize + '%';
  document.getElementById('readerContent').style.fontSize = (1.1 * state.fontSize / 100) + 'rem';
  localStorage.setItem('fontSize', state.fontSize);
}

function setupReadingProgress() {
  const content = document.getElementById('readerContent');
  content.addEventListener('scroll', updateReadingProgress);
}

function updateReadingProgress() {
  const content = document.getElementById('readerContent');
  const progress = (content.scrollTop / (content.scrollHeight - content.clientHeight)) * 100;
  document.querySelector('.reader-progress .progress-bar').style.width = progress + '%';
}

// ==================== EXPORT ====================
function openExportModal() {
  document.getElementById('exportModal').classList.add('active');
}

function closeExportModal() {
  document.getElementById('exportModal').classList.remove('active');
}

function exportStory(format) {
  const story = state.currentStory;
  if (!story) return;

  const content = `${story.title}\n\n${story.genre}\n\n${story.content}`;
  const filename = story.title.replace(/[^\w-]/g, '_');

  switch(format) {
    case 'txt':
      downloadFile(content, `${filename}.txt`, 'text/plain');
      break;
    case 'html':
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${story.title}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 2em auto; line-height: 1.8; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>${story.title}</h1>
  <p><strong>Genre:</strong> ${story.genre}</p>
  <div>${story.content.replace(/\n/g, '<p>')}</p></div>
</body>
</html>`;
      downloadFile(html, `${filename}.html`, 'text/html');
      break;
    case 'pdf':
      const element = document.createElement('div');
      element.innerHTML = `<h1>${story.title}</h1><p>${story.genre}</p><div>${story.content.replace(/\n/g, '<p>')}</p></div>`;
      const opt = {
        margin: 10,
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      };
      html2pdf().set(opt).from(element).save();
      break;
    case 'docx':
      showToast('Export DOCX: Utilisez un service en ligne pour cette conversion');
      break;
    case 'epub':
      showToast('Export EPUB: Fonctionnalité disponible bientôt');
      break;
  }

  closeExportModal();
  showToast(`Histoire exportée en ${format.toUpperCase()}!`);
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

function copyToClipboard() {
  const story = state.currentStory;
  if (!story) return;
  const content = `${story.title}\n\n${story.genre}\n\n${story.content}`;
  navigator.clipboard.writeText(content).then(() => {
    showToast('Copié dans le presse-papiers!');
    closeExportModal();
  });
}

// ==================== STATS ====================
function setWordGoal() {
  const goal = parseInt(document.getElementById('wordGoal').value);
  if (goal > 0) {
    state.wordGoal = goal;
    localStorage.setItem('wordGoal', goal);
    updateGoalProgress();
    showToast('Objectif défini!');
  }
}

function updateGoalProgress() {
  if (state.wordGoal === 0) return;
  
  const totalWords = state.stories.reduce((sum, story) => sum + story.wordCount, 0);
  const percentage = Math.min((totalWords / state.wordGoal) * 100, 100);
  
  document.getElementById('goalBar').style.width = percentage + '%';
  document.getElementById('goalText').textContent = `${totalWords} / ${state.wordGoal} mots`;
}

function updateStatsDisplay() {
  const totalStories = state.stories.length;
  const totalWords = state.stories.reduce((sum, story) => sum + story.wordCount, 0);
  const totalReadTime = Math.ceil(totalWords / 200);
  const hours = Math.floor(totalReadTime / 60);
  const minutes = totalReadTime % 60;

  document.getElementById('totalStories').textContent = totalStories;
  document.getElementById('totalWords').textContent = totalWords.toLocaleString();
  document.getElementById('totalReadTime').textContent = `${hours}h ${minutes}m`;
  
  updateGoalProgress();
}

function initializeCharts() {
  // Will be populated with weekly data
  state.weeklyStats = Array(7).fill(0);
  const savedStats = localStorage.getItem('weeklyStats');
  if (savedStats) {
    state.weeklyStats = JSON.parse(savedStats);
  }
}

function updateChart() {
  const ctx = document.getElementById('progressChart');
  if (!ctx) return;

  const chartCanvas = ctx.getContext('2d');
  
  // Destroy existing chart if any
  if (window.progressChart) {
    window.progressChart.destroy();
  }

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  window.progressChart = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        {
          label: 'Mots écrits',
          data: state.weeklyStats,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: getComputedStyle(document.body).color
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: getComputedStyle(document.body).color
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          ticks: {
            color: getComputedStyle(document.body).color
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// ==================== STORAGE ====================
function saveStoriesToStorage() {
  localStorage.setItem('stories', JSON.stringify(state.stories));
  updateStatsDisplay();
}

function loadStoriesFromStorage() {
  const saved = localStorage.getItem('stories');
  if (saved) {
    state.stories = JSON.parse(saved);
    // Convert date strings back to Date objects
    state.stories.forEach(story => {
      story.createdAt = new Date(story.createdAt);
    });
  }
  
  const savedGoal = localStorage.getItem('wordGoal');
  if (savedGoal) {
    state.wordGoal = parseInt(savedGoal);
    document.getElementById('wordGoal').value = state.wordGoal;
  }
  
  const savedFontSize = localStorage.getItem('fontSize');
  if (savedFontSize) {
    state.fontSize = parseInt(savedFontSize);
  }
}

// ==================== UTILITIES ====================
function deleteStory(id) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette histoire?')) {
    state.stories = state.stories.filter(s => s.id !== id);
    saveStoriesToStorage();
    filterStories();
    showToast('Histoire supprimée');
  }
}

function formatDate(date) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString('fr-FR', options);
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function render() {
  updateStatsDisplay();
  filterStories();
}