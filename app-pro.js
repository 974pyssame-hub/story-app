// ==================== STATE MANAGEMENT ====================
const state = {
  currentUser: null,
  users: [],
  stories: [],
  categories: [],
  notifications: [],
  followers: {},
  bookmarks: [],
  isDarkMode: localStorage.getItem('darkMode') === 'true',
  fontSize: 100,
  currentView: 'feed'
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  loadDataFromStorage();
  applyTheme();
  setupAuthListeners();
  checkUserLogin();
});

// ==================== AUTH SYSTEM ====================
function setupAuthListeners() {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      switchAuthTab(tabName);
    });
  });

  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

function switchAuthTab(tabName) {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  document.querySelectorAll('.auth-form').forEach(form => {
    form.classList.remove('active');
  });
  document.getElementById(tabName + 'Form').classList.add('active');
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const user = state.users.find(u => (u.email === email || u.username === email) && u.password === password);
  
  if (user) {
    state.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    showApp();
    showToast('Bienvenue ' + user.username + '!');
  } else {
    showToast('Identifiants incorrects', 'error');
  }
}

function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const bio = document.getElementById('registerBio').value;

  if (state.users.find(u => u.username === username)) {
    showToast('Ce pseudo existe déjà', 'error');
    return;
  }

  const newUser = {
    id: Date.now(),
    username,
    email,
    password,
    bio,
    avatar: generateAvatar(username),
    stories: [],
    followers: [],
    following: [],
    categories: [],
    createdAt: new Date()
  };

  state.users.push(newUser);
  state.currentUser = newUser;
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  saveDataToStorage();
  showApp();
  showToast('Compte créé avec succès!');
}

function handleLogout() {
  if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
    state.currentUser = null;
    localStorage.removeItem('currentUser');
    location.reload();
  }
}

function checkUserLogin() {
  const saved = localStorage.getItem('currentUser');
  if (saved) {
    state.currentUser = JSON.parse(saved);
    // Vérifier que l'utilisateur existe encore
    const user = state.users.find(u => u.id === state.currentUser.id);
    if (user) {
      showApp();
    } else {
      handleLogout();
    }
  }
}

function showApp() {
  document.getElementById('authModal').style.display = 'none';
  document.getElementById('mainApp').style.display = 'block';
  initializeApp();
}

function generateAvatar(username) {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = colors[hash % colors.length];
  return `https://ui-avatars.com/api/?name=${username}&background=${color.slice(1)}&color=fff`;
}

// ==================== APP INITIALIZATION ====================
function initializeApp() {
  setupEventListeners();
  loadSampleData();
  updateUserProfile();
  switchView('feed');
  render();
}

function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = e.currentTarget.dataset.view;
      switchView(view);
    });
  });

  // Theme
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Notifications
  document.getElementById('notifBell').addEventListener('click', toggleNotifications);
  document.getElementById('clearNotifs').addEventListener('click', clearNotifications);

  // Feed
  document.getElementById('quickWriteBtn').addEventListener('click', () => switchView('writer'));
  document.getElementById('addCategoryBtn').addEventListener('click', openCategoryModal);

  // Library
  document.getElementById('searchInput').addEventListener('input', filterStories);
  document.getElementById('categoryFilter').addEventListener('change', filterStories);
  document.getElementById('sortBy').addEventListener('change', filterStories);

  // Writer
  document.getElementById('storyContent').addEventListener('input', updateEditorStats);
  document.getElementById('saveStory').addEventListener('click', saveStory);
  document.getElementById('generateCoverBtn').addEventListener('click', openCoverGenerator);
  document.getElementById('uploadCoverBtn').addEventListener('click', () => document.getElementById('coverInput').click());
  document.getElementById('coverInput').addEventListener('change', uploadCover);
  document.getElementById('newStory').addEventListener('click', createNewStory);
  document.getElementById('exportStory').addEventListener('click', openExportModal);
  document.getElementById('publishStory').addEventListener('click', publishStory);

  // Reader
  document.getElementById('closeReader').addEventListener('click', () => switchView('library'));
  document.getElementById('fontSmall').addEventListener('click', () => changeFontSize(-10));
  document.getElementById('fontLarge').addEventListener('click', () => changeFontSize(10));
  document.getElementById('toggleBookmark').addEventListener('click', toggleBookmark);

  // Explore
  document.getElementById('exploreSearch').addEventListener('input', filterExplore);
  document.getElementById('exploreCategoryFilter').addEventListener('change', filterExplore);
  document.getElementById('exploreSortBy').addEventListener('change', filterExplore);

  // Profile
  document.getElementById('editProfileBtn').addEventListener('click', openEditProfile);
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', (e) => switchProfileTab(e.target.dataset.tab));
  });

  // Modals
  setupModalListeners();
}

function setupModalListeners() {
  // Cover Generator
  document.getElementById('regenerateCoverBtn').addEventListener('click', regenerateCover);
  document.getElementById('useCoverBtn').addEventListener('click', useCover);
  document.getElementById('closeCoverBtn').addEventListener('click', () => closeCoverGenerator());

  // Category
  document.getElementById('createCategoryBtn').addEventListener('click', createCategory);
  document.getElementById('closeCategoryBtn').addEventListener('click', () => closeCategoryModal());

  // Profile Edit
  document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
  document.getElementById('closeProfileEditBtn').addEventListener('click', () => closeEditProfile());

  // Export
  document.querySelectorAll('.export-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const format = e.currentTarget.dataset.format;
      exportStory(format);
    });
  });
  document.getElementById('copyToClipboard').addEventListener('click', copyToClipboard);

  // Close modals on background click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Close buttons
  document.querySelectorAll('.btn-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.modal').classList.remove('active');
    });
  });
}

// ==================== VIEW SWITCHING ====================
function switchView(viewName) {
  state.currentView = viewName;

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });

  const view = document.getElementById(viewName);
  if (view) {
    view.classList.add('active');
    
    if (viewName === 'profile') {
      updateProfileDisplay();
    } else if (viewName === 'explore') {
      filterExplore();
    }
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

// ==================== NOTIFICATIONS ====================
function toggleNotifications() {
  const dropdown = document.getElementById('notifDropdown');
  dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  renderNotifications();
}

function renderNotifications() {
  const list = document.getElementById('notifList');
  if (state.notifications.length === 0) {
    list.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-secondary);">Aucune notification</div>';
    return;
  }

  list.innerHTML = state.notifications.map(notif => `
    <div class="notif-item ${!notif.read ? 'unread' : ''}">
      <div class="notif-title">${notif.title}</div>
      <div class="notif-text">${notif.text}</div>
      <div class="notif-time">${formatTimeAgo(notif.createdAt)}</div>
    </div>
  `).join('');
}

function addNotification(title, text, type = 'info') {
  const notif = {
    id: Date.now(),
    title,
    text,
    type,
    read: false,
    createdAt: new Date(),
    userId: state.currentUser.id
  };

  state.notifications.unshift(notif);
  updateNotifBadge();
}

function updateNotifBadge() {
  const unread = state.notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notifCount');
  if (unread > 0) {
    badge.textContent = unread;
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
}

function clearNotifications() {
  state.notifications = [];
  updateNotifBadge();
  renderNotifications();
}

// ==================== FEED ====================
function updateUserProfile() {
  document.getElementById('feedUsername').textContent = state.currentUser.username;
  document.getElementById('feedBio').textContent = state.currentUser.bio || 'Aucune bio';
  document.getElementById('feedAvatar').src = state.currentUser.avatar;
  document.getElementById('quickAvatar').src = state.currentUser.avatar;
  
  const userStories = state.stories.filter(s => s.authorId === state.currentUser.id);
  document.getElementById('feedStories').textContent = userStories.length;
  document.getElementById('feedFollowers').textContent = state.currentUser.followers.length;
  document.getElementById('feedFollowing').textContent = state.currentUser.following.length;

  renderCategories();
  renderFollowedAuthors();
  renderTrendingStories();
  renderFeed();
}

function renderCategories() {
  const container = document.getElementById('myCategories');
  const userCategories = state.categories.filter(c => c.userId === state.currentUser.id);
  
  if (userCategories.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Aucune catégorie</p>';
    return;
  }

  container.innerHTML = userCategories.map(cat => `
    <div class="category-badge" style="border-left: 4px solid ${cat.color};">
      <strong>${cat.name}</strong>
      <p style="font-size: 0.75rem; color: var(--text-secondary);">${cat.description}</p>
    </div>
  `).join('');
}

function renderFollowedAuthors() {
  const container = document.getElementById('followedAuthors');
  const followed = state.users.filter(u => state.currentUser.following.includes(u.id));
  
  if (followed.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Aucun auteur suivi</p>';
    return;
  }

  container.innerHTML = followed.map(author => `
    <div class="author-item">
      <img src="${author.avatar}" class="avatar-sm" alt="">
      <div style="flex: 1;">
        <strong>${author.username}</strong>
        <p style="font-size: 0.75rem; color: var(--text-secondary);">${author.stories ? author.stories.length : 0} histoires</p>
      </div>
    </div>
  `).join('');
}

function renderTrendingStories() {
  const container = document.getElementById('trendingStories');
  const published = state.stories.filter(s => s.published);
  const trending = published.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  if (trending.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Aucune histoire</p>';
    return;
  }

  container.innerHTML = trending.map(story => `
    <div class="trend-item">
      <div class="trend-title">${story.title}</div>
      <div class="trend-count"><i class="fas fa-eye"></i> ${story.views || 0} vues</div>
    </div>
  `).join('');
}

function renderFeed() {
  const container = document.getElementById('feedContent');
  const followed = state.users.filter(u => state.currentUser.following.includes(u.id));
  const followedIds = followed.map(u => u.id);
  const feed = state.stories.filter(s => followedIds.includes(s.authorId) && s.published);

  if (feed.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-book"></i>
        <p>Aucune mise à jour. Suivez des auteurs!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = feed.map(story => {
    const author = state.users.find(u => u.id === story.authorId);
    return `
      <div class="post-item">
        <div class="post-header">
          <img src="${author.avatar}" class="avatar-sm" alt="">
          <div>
            <div class="post-title">${story.title}</div>
            <div class="post-meta">par ${author.username} • ${formatTimeAgo(story.updatedAt)}</div>
          </div>
        </div>
        <p>${story.description || story.excerpt}</p>
        <div class="post-actions">
          <button class="post-action-btn" onclick="openReader(${story.id})">
            <i class="fas fa-book-open"></i> Lire
          </button>
          <button class="post-action-btn" onclick="toggleBookmark(${story.id})">
            <i class="far fa-bookmark"></i> Ajouter
          </button>
          <button class="post-action-btn" onclick="followAuthor(${author.id})">
            <i class="fas fa-user-plus"></i> Suivre
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function followAuthor(authorId) {
  if (!state.currentUser.following.includes(authorId)) {
    state.currentUser.following.push(authorId);
    const author = state.users.find(u => u.id === authorId);
    author.followers.push(state.currentUser.id);
    
    addNotification(
      'Nouveau suivi',
      `${state.currentUser.username} vous suit maintenant`,
      'follow'
    );
    
    saveDataToStorage();
    updateUserProfile();
    showToast('Auteur suivi!');
  }
}

// ==================== LIBRARY ====================
function filterStories() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const categoryFilter = document.getElementById('categoryFilter').value;
  const sortBy = document.getElementById('sortBy').value;

  let filtered = state.stories.filter(story => {
    return story.authorId === state.currentUser.id && (
      story.title.toLowerCase().includes(searchTerm) ||
      story.excerpt.toLowerCase().includes(searchTerm)
    ) && (!categoryFilter || story.categoryId === parseInt(categoryFilter));
  });

  filtered.sort((a, b) => {
    switch(sortBy) {
      case 'date-desc':
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      case 'date-asc':
        return new Date(a.updatedAt) - new Date(b.updatedAt);
      case 'length-desc':
        return b.wordCount - a.wordCount;
      case 'length-asc':
        return a.wordCount - b.wordCount;
      case 'title-asc':
        return a.title.localeCompare(b.title);
    }
  });

  renderLibraryStories(filtered);
}

function renderLibraryStories(stories) {
  const grid = document.getElementById('storiesGrid');
  
  if (stories.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1;">
        <div class="empty-state">
          <i class="fas fa-book"></i>
          <p>Aucune histoire. Commencez à écrire!</p>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = stories.map(story => `
    <div class="story-card">
      <img src="${story.cover || 'https://via.placeholder.com/280x225?text=Couverture'}" class="story-cover" alt="Couverture">
      <div class="story-card-header">
        <h3 class="story-card-title">${story.title}</h3>
        <p class="story-card-excerpt">${story.excerpt}</p>
      </div>
      <div class="story-card-meta">
        <span><i class="fas fa-calendar"></i> ${formatDate(story.updatedAt)}</span>
        <span><i class="fas fa-clock"></i> ${Math.ceil(story.wordCount / 200)} min</span>
        <span><i class="fas fa-words"></i> ${story.wordCount} mots</span>
      </div>
      <div class="story-card-footer">
        <button class="read-btn" onclick="openReader(${story.id})">
          <i class="fas fa-book-open"></i> Lire
        </button>
        <button class="edit-btn" onclick="editStory(${story.id})">
          <i class="fas fa-edit"></i> Éditer
        </button>
        <button class="delete-btn" onclick="deleteStory(${story.id})">
          <i class="fas fa-trash"></i> Supprimer
        </button>
      </div>
    </div>
  `).join('');
}

// ==================== EDITOR ====================
const editor = {
  currentStory: null
};

function createNewStory() {
  editor.currentStory = null;
  document.getElementById('storyTitle').value = '';
  document.getElementById('storyCategory').value = '';
  document.getElementById('storyDescription').value = '';
  document.getElementById('storyContent').value = '';
  document.getElementById('storycover').src = 'https://via.placeholder.com/150x225?text=Couverture';
  document.getElementById('saveStory').innerHTML = '<i class="fas fa-save"></i> Sauvegarder';
  document.getElementById('exportStory').style.display = 'none';
  document.getElementById('publishStory').style.display = 'none';
  
  updateCategorySelect();
  updateEditorStats();
  switchView('writer');
}

function updateCategorySelect() {
  const select = document.getElementById('storyCategory');
  const userCategories = state.categories.filter(c => c.userId === state.currentUser.id);
  
  select.innerHTML = '<option value="">Choisir une catégorie</option>' +
    userCategories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
}

function editStory(id) {
  const story = state.stories.find(s => s.id === id);
  if (story) {
    editor.currentStory = story;
    document.getElementById('storyTitle').value = story.title;
    document.getElementById('storyCategory').value = story.categoryId || '';
    document.getElementById('storyDescription').value = story.description || '';
    document.getElementById('storyContent').value = story.content;
    document.getElementById('storycover').src = story.cover || 'https://via.placeholder.com/150x225?text=Couverture';
    document.getElementById('exportStory').style.display = 'block';
    document.getElementById('publishStory').style.display = story.published ? 'none' : 'block';
    
    updateCategorySelect();
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
  const categoryId = parseInt(document.getElementById('storyCategory').value) || null;
  const description = document.getElementById('storyDescription').value;
  const content = document.getElementById('storyContent').value.trim();
  const cover = document.getElementById('storycover').src;

  if (!title || !content) {
    showToast('Veuillez remplir le titre et le contenu', 'error');
    return;
  }

  const excerpt = content.substring(0, 150) + (content.length > 150 ? '...' : '');
  const wordCount = content.split(/\s+/).length;

  if (editor.currentStory) {
    editor.currentStory.title = title;
    editor.currentStory.categoryId = categoryId;
    editor.currentStory.description = description;
    editor.currentStory.content = content;
    editor.currentStory.excerpt = excerpt;
    editor.currentStory.wordCount = wordCount;
    editor.currentStory.cover = cover;
    editor.currentStory.updatedAt = new Date();
  } else {
    state.stories.push({
      id: Date.now(),
      authorId: state.currentUser.id,
      title,
      categoryId,
      description,
      content,
      excerpt,
      wordCount,
      cover,
      published: false,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  saveDataToStorage();
  showToast('Histoire sauvegardée!');
  document.getElementById('saveStory').classList.add('saved');
  setTimeout(() => document.getElementById('saveStory').classList.remove('saved'), 2000);
}

function publishStory() {
  if (!editor.currentStory) {
    showToast('Aucune histoire à publier', 'error');
    return;
  }

  if (confirm('Confirmer la publication? Elle sera visible pour les autres utilisateurs.')) {
    editor.currentStory.published = true;
    editor.currentStory.publishedAt = new Date();
    saveDataToStorage();
    addNotification('Histoire publiée', `${editor.currentStory.title} est maintenant visible`, 'publish');
    showToast('Histoire publiée!');
    document.getElementById('publishStory').style.display = 'none';
  }
}

// ==================== COVER GENERATOR ====================
function openCoverGenerator() {
  document.getElementById('coverGeneratorModal').classList.add('active');
  regenerateCover();
}

function closeCoverGenerator() {
  document.getElementById('coverGeneratorModal').classList.remove('active');
}

function regenerateCover() {
  const title = document.getElementById('storyTitle').value || 'Mon Histoire';
  const style = document.getElementById('coverStyle').value;
  const color1 = document.getElementById('coverColorPrimary').value;
  const color2 = document.getElementById('coverColorSecondary').value;

  const cover = document.getElementById('generatedCover');
  document.getElementById('coverTitle').textContent = title;

  switch(style) {
    case 'gradient':
      cover.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
      break;
    case 'geometric':
      cover.style.background = `linear-gradient(45deg, ${color1} 25%, transparent 25%, transparent 75%, ${color1} 75%, ${color1}), 
                               linear-gradient(45deg, ${color2} 25%, transparent 25%, transparent 75%, ${color2} 75%, ${color2})`;
      cover.style.backgroundSize = '40px 40px';
      cover.style.backgroundPosition = '0 0, 20px 20px';
      break;
    case 'minimal':
      cover.style.background = color1;
      cover.style.borderLeft = `15px solid ${color2}`;
      break;
    case 'vibrant':
      cover.style.background = `repeating-linear-gradient(90deg, ${color1}, ${color1} 20px, ${color2} 20px, ${color2} 40px)`;
      break;
  }
}

function useCover() {
  const cover = document.getElementById('generatedCover');
  const canvas = document.createElement('canvas');
  canvas.width = 150;
  canvas.height = 225;
  
  const ctx = canvas.getContext('2d');
  const title = document.getElementById('storyTitle').value || 'Mon Histoire';
  const style = document.getElementById('coverStyle').value;
  const color1 = document.getElementById('coverColorPrimary').value;
  const color2 = document.getElementById('coverColorSecondary').value;

  // Draw background
  if (style === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, 150, 225);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = color1;
  }
  ctx.fillRect(0, 0, 150, 225);

  // Draw text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const words = title.split(' ');
  let y = 112.5;
  words.forEach((word, i) => {
    ctx.fillText(word, 75, y + (i * 25));
  });

  document.getElementById('storycover').src = canvas.toDataURL();
  closeCoverGenerator();
  showToast('Couverture appliquée!');
}

function uploadCover(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      document.getElementById('storycover').src = event.target.result;
      showToast('Couverture uploadée!');
    };
    reader.readAsDataURL(file);
  }
}

// ==================== READER ====================
function openReader(id) {
  const story = state.stories.find(s => s.id === id);
  if (!story) return;

  editor.currentStory = story;
  document.getElementById('readerTitle').textContent = story.title;
  
  const author = state.users.find(u => u.id === story.authorId);
  document.getElementById('readerAuthor').textContent = 'par ' + author.username;
  
  document.getElementById('readerContent').innerHTML = `<p>${story.content.replace(/\n/g, '</p><p>')}</p>`;
  document.getElementById('readingTime').textContent = `Temps de lecture estimé: ${Math.ceil(story.wordCount / 200)} min`;
  document.getElementById('fontSizeDisplay').textContent = state.fontSize + '%';
  document.getElementById('readerContent').style.fontSize = (1.1 * state.fontSize / 100) + 'rem';

  if (story.published && story.authorId !== state.currentUser.id) {
    story.views = (story.views || 0) + 1;
  }

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

function toggleBookmark(storyId) {
  const id = storyId || (editor.currentStory ? editor.currentStory.id : null);
  if (!id) return;

  if (!state.bookmarks.includes(id)) {
    state.bookmarks.push(id);
    showToast('Ajouté aux favoris!');
  } else {
    state.bookmarks = state.bookmarks.filter(b => b !== id);
    showToast('Retiré des favoris!');
  }
  saveDataToStorage();
}

// ==================== EXPLORE ====================
function filterExplore() {
  const searchTerm = document.getElementById('exploreSearch').value.toLowerCase();
  const categoryFilter = document.getElementById('exploreCategoryFilter').value;
  const sortBy = document.getElementById('exploreSortBy').value;

  let filtered = state.stories.filter(story => 
    story.published && (
      story.title.toLowerCase().includes(searchTerm) ||
      story.excerpt.toLowerCase().includes(searchTerm)
    ) && (!categoryFilter || story.categoryId === parseInt(categoryFilter))
  );

  // Sort
  filtered.sort((a, b) => {
    switch(sortBy) {
      case 'trending':
        return (b.views || 0) - (a.views || 0);
      case 'recent':
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      case 'popular':
        return (b.views || 0) - (a.views || 0);
      case 'top-rated':
        return (b.rating || 0) - (a.rating || 0);
    }
  });

  renderExploreStories(filtered);
}

function renderExploreStories(stories) {
  const grid = document.getElementById('exploreGrid');
  
  if (stories.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1;">
        <div class="empty-state">
          <i class="fas fa-compass"></i>
          <p>Aucune histoire trouvée</p>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = stories.map(story => {
    const author = state.users.find(u => u.id === story.authorId);
    return `
      <div class="story-card">
        <img src="${story.cover || 'https://via.placeholder.com/280x225?text=Couverture'}" class="story-cover" alt="Couverture">
        <div class="story-card-header">
          <p class="story-card-author">par ${author.username}</p>
          <h3 class="story-card-title">${story.title}</h3>
          <p class="story-card-excerpt">${story.excerpt}</p>
        </div>
        <div class="story-card-meta">
          <span><i class="fas fa-eye"></i> ${story.views || 0}</span>
          <span><i class="fas fa-clock"></i> ${Math.ceil(story.wordCount / 200)} min</span>
        </div>
        <div class="story-card-footer">
          <button class="read-btn" onclick="openReader(${story.id})">
            <i class="fas fa-book-open"></i> Lire
          </button>
          <button class="edit-btn" onclick="toggleBookmark(${story.id})">
            <i class="far fa-bookmark"></i> Ajouter
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== PROFILE ====================
function updateProfileDisplay() {
  const userStories = state.stories.filter(s => s.authorId === state.currentUser.id);
  const publishedStories = userStories.filter(s => s.published);
  const draftStories = userStories.filter(s => !s.published);
  const totalWords = userStories.reduce((sum, s) => sum + s.wordCount, 0);
  const totalReadTime = Math.ceil(totalWords / 200);

  document.getElementById('profileAvatar').src = state.currentUser.avatar;
  document.getElementById('profileName').textContent = state.currentUser.username;
  document.getElementById('profileBio').textContent = state.currentUser.bio || 'Aucune bio';
  
  document.getElementById('profileStories').textContent = userStories.length;
  document.getElementById('profileFollowers').textContent = state.currentUser.followers.length;
  document.getElementById('profileFollowing').textContent = state.currentUser.following.length;

  document.getElementById('totalWordsProfile').textContent = totalWords.toLocaleString();
  document.getElementById('totalReadTimeProfile').textContent = Math.floor(totalReadTime / 60) + 'h ' + (totalReadTime % 60) + 'm';
  document.getElementById('publishedStoriesProfile').textContent = publishedStories.length;
  document.getElementById('draftStoriesProfile').textContent = draftStories.length;

  // Render profile stories
  renderLibraryStories(userStories);
  document.getElementById('profileStoriesGrid').innerHTML = document.getElementById('storiesGrid').innerHTML;

  // Render categories
  const userCategories = state.categories.filter(c => c.userId === state.currentUser.id);
  document.getElementById('profileCategories').innerHTML = userCategories.map(cat => `
    <div class="category-card">
      <div class="category-color" style="background-color: ${cat.color};"></div>
      <h4>${cat.name}</h4>
      <p>${cat.description}</p>
      <p style="font-size: 0.875rem; margin-top: 0.75rem;">
        ${state.stories.filter(s => s.categoryId === cat.id).length} histoires
      </p>
    </div>
  `).join('');
}

function switchProfileTab(tabName) {
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  document.querySelectorAll('.profile-tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(tabName + 'Tab').classList.add('active');
}

function openEditProfile() {
  document.getElementById('editBio').value = state.currentUser.bio || '';
  document.getElementById('editProfileModal').classList.add('active');
}

function closeEditProfile() {
  document.getElementById('editProfileModal').classList.remove('active');
}

function saveProfile() {
  state.currentUser.bio = document.getElementById('editBio').value;
  saveDataToStorage();
  updateProfileDisplay();
  closeEditProfile();
  showToast('Profil mis à jour!');
}

// ==================== CATEGORIES ====================
function openCategoryModal() {
  document.getElementById('categoryName').value = '';
  document.getElementById('categoryDescription').value = '';
  document.getElementById('categoryColor').value = '#6366f1';
  document.getElementById('categoryModal').classList.add('active');
}

function closeCategoryModal() {
  document.getElementById('categoryModal').classList.remove('active');
}

function createCategory() {
  const name = document.getElementById('categoryName').value;
  const description = document.getElementById('categoryDescription').value;
  const color = document.getElementById('categoryColor').value;

  if (!name) {
    showToast('Entrez un nom de catégorie', 'error');
    return;
  }

  state.categories.push({
    id: Date.now(),
    userId: state.currentUser.id,
    name,
    description,
    color,
    createdAt: new Date()
  });

  saveDataToStorage();
  updateCategorySelect();
  renderCategories();
  closeCategoryModal();
  showToast('Catégorie créée!');
}

// ==================== EXPORT ====================
function openExportModal() {
  document.getElementById('exportModal').classList.add('active');
}

function exportStory(format) {
  if (!editor.currentStory) return;

  const story = editor.currentStory;
  const content = `${story.title}\n\n${story.description || story.excerpt}\n\n${story.content}`;
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
  <p><strong>Auteur:</strong> ${state.users.find(u => u.id === story.authorId).username}</p>
  <p>${story.description || story.excerpt}</p>
  <div>${story.content.replace(/\n/g, '<p>')}</p></div>
</body>
</html>`;
      downloadFile(html, `${filename}.html`, 'text/html');
      break;
    case 'pdf':
      const element = document.createElement('div');
      element.innerHTML = `<h1>${story.title}</h1><p>${story.description || story.excerpt}</p><div>${story.content.replace(/\n/g, '<p>')}</p></div>`;
      const opt = {
        margin: 10,
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      };
      html2pdf().set(opt).from(element).save();
      break;
  }

  document.getElementById('exportModal').classList.remove('active');
  showToast(`Exporté en ${format.toUpperCase()}!`);
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
  if (!editor.currentStory) return;
  const content = `${editor.currentStory.title}\n\n${editor.currentStory.content}`;
  navigator.clipboard.writeText(content).then(() => {
    showToast('Copié dans le presse-papiers!');
    document.getElementById('exportModal').classList.remove('active');
  });
}

// ==================== SAMPLE DATA ====================
function loadSampleData() {
  if (state.users.length === 0) {
    // Create sample users
    const sampleUsers = [
      {
        id: 101,
        username: 'auteur_mystère',
        email: 'mystery@example.com',
        password: 'password123',
        bio: 'Passionné par les histoires de suspense',
        avatar: generateAvatar('auteur_mystère'),
        stories: [],
        followers: [],
        following: [],
        categories: [],
        createdAt: new Date()
      },
      {
        id: 102,
        username: 'rêveur_fantasy',
        email: 'fantasy@example.com',
        password: 'password123',
        bio: 'Créateur de mondes fantastiques',
        avatar: generateAvatar('rêveur_fantasy'),
        stories: [],
        followers: [],
        following: [],
        categories: [],
        createdAt: new Date()
      }
    ];

    state.users.push(...sampleUsers);

    // Create sample categories for current user
    state.categories.push({
      id: 1,
      userId: state.currentUser.id,
      name: 'Ébauches',
      description: 'Histoires en cours de développement',
      color: '#FF6B6B',
      createdAt: new Date()
    });

    state.categories.push({
      id: 2,
      userId: state.currentUser.id,
      name: 'Publiées',
      description: 'Histoires finies et partagées',
      color: '#10b981',
      createdAt: new Date()
    });

    // Create sample stories
    state.stories.push({
      id: 1001,
      authorId: 101,
      title: 'Le Secret de la Nuit',
      categoryId: null,
      description: 'Une histoire de suspense où un secret ancien refait surface',
      content: 'Il était minuit quand elle découvrit la lettre cachée sous les planches du grenier...',
      excerpt: 'Une histoire de suspense où un secret ancien refait surface',
      wordCount: 3500,
      cover: 'https://via.placeholder.com/280x225?text=Mystère',
      published: true,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      views: 245,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    });

    state.stories.push({
      id: 1002,
      authorId: 102,
      title: 'Le Royaume Perdu',
      categoryId: null,
      description: 'Une épopée fantastique dans un monde magique oublié',
      content: 'Au-delà des montagnes grises se cachait un royaume dont les légendes parlaient...',
      excerpt: 'Une épopée fantastique dans un monde magique oublié',
      wordCount: 5200,
      cover: 'https://via.placeholder.com/280x225?text=Fantasy',
      published: true,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      views: 512,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    saveDataToStorage();
  }

  // Update category filter select
  const categoryFilter = document.getElementById('categoryFilter');
  const exploreCategoryFilter = document.getElementById('exploreCategoryFilter');
  const userCategories = state.categories.filter(c => c.userId === state.currentUser.id);
  
  categoryFilter.innerHTML = '<option value="">Toutes les catégories</option>' +
    userCategories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
  
  const allCategories = state.categories;
  exploreCategoryFilter.innerHTML = '<option value="">Toutes les catégories</option>' +
    allCategories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
}

// ==================== STORAGE ====================
function saveDataToStorage() {
  localStorage.setItem('storyAppUsers', JSON.stringify(state.users));
  localStorage.setItem('storyAppStories', JSON.stringify(state.stories));
  localStorage.setItem('storyAppCategories', JSON.stringify(state.categories));
  localStorage.setItem('storyAppNotifications', JSON.stringify(state.notifications));
  localStorage.setItem('storyAppBookmarks', JSON.stringify(state.bookmarks));
  localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
}

function loadDataFromStorage() {
  const users = localStorage.getItem('storyAppUsers');
  const stories = localStorage.getItem('storyAppStories');
  const categories = localStorage.getItem('storyAppCategories');
  const notifications = localStorage.getItem('storyAppNotifications');
  const bookmarks = localStorage.getItem('storyAppBookmarks');

  if (users) state.users = JSON.parse(users);
  if (stories) state.stories = JSON.parse(stories);
  if (categories) state.categories = JSON.parse(categories);
  if (notifications) state.notifications = JSON.parse(notifications);
  if (bookmarks) state.bookmarks = JSON.parse(bookmarks);
}

// ==================== UTILITIES ====================
function render() {
  updateUserProfile();
  filterExplore();
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function formatDate(date) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString('fr-FR', options);
}

function formatTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - new Date(date)) / 1000);
  
  if (seconds < 60) return 'À l\'instant';
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
  return `Il y a ${Math.floor(seconds / 86400)}j`;
}

function deleteStory(id) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette histoire?')) {
    state.stories = state.stories.filter(s => s.id !== id);
    saveDataToStorage();
    filterStories();
    showToast('Histoire supprimée');
  }
}
