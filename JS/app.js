const STORAGE_KEYS = {
    users: 'educademy_users_v1',
    session: 'educademy_session_user_v1',
    posts: 'educademy_posts',
    purchases: 'educademy_purchases',
};

function safeJsonParse(value, fallback) {
    try {
        if (!value) return fallback;
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function getUsers() {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.users), []);
}

function setUsers(users) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getSession() {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.session), null);
}

function setSession(session) {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
}

function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.session);
}

function ensureSeedData() {
    const users = getUsers();
    if (users.length === 0) {
        users.push({ email: 'demo@educademy.com', username: 'demo', password: 'demo' });
        setUsers(users);
    }

    const posts = safeJsonParse(localStorage.getItem(STORAGE_KEYS.posts), null);
    if (!posts) {
        const seedPosts = [
            { username: 'user123', message: '¡Excelente plataforma! Los cursos son muy completos.', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3 },
            { username: 'maria_dev', message: 'El curso de Python es increíble, lo recomiendo mucho.', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2 },
            { username: 'carlos_code', message: '¿Cuándo van a agregar más cursos de JavaScript?', createdAt: Date.now() - 1000 * 60 * 60 * 24 },
        ];
        localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(seedPosts));
    }
}

function initPasswordToggles() {
    const toggles = document.querySelectorAll('.ojo, .ojo2');
    toggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
            const container = toggle.closest('.input-div');
            if (!container) return;
            const input = container.querySelector('input');
            if (!input) return;
            input.type = input.type === 'password' ? 'text' : 'password';
            toggle.classList.toggle('fa-eye');
            toggle.classList.toggle('fa-eye-slash');
        });
    });
}

function initRegister() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = form.querySelector('#correo')?.value?.trim() || '';
        const username = form.querySelector('#usu')?.value?.trim() || '';
        const password = form.querySelector('#contra')?.value || '';
        const confirmPassword = form.querySelector('#con_contra')?.value || '';

        if (!email || !username || !password) {
            window.alert('Completa todos los campos.');
            return;
        }

        if (password.length < 6) {
            window.alert('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            window.alert('Las contraseñas no coinciden.');
            return;
        }

        const users = getUsers();
        const exists = users.some((u) => u.username.toLowerCase() === username.toLowerCase());
        if (exists) {
            window.alert('Ese usuario ya existe. Prueba con otro.');
            return;
        }

        users.push({ email, username, password });
        setUsers(users);
        setSession({ username });

        window.location.href = 'home.html';
    });
}

function initLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const identifier = form.querySelector('#usu')?.value?.trim() || '';
        const password = form.querySelector('#contra')?.value || '';

        if (!identifier || !password) {
            window.alert('Completa usuario y contraseña.');
            return;
        }

        const users = getUsers();
        const idLower = identifier.toLowerCase();
        const user = users.find((u) => (u.username || '').toLowerCase() === idLower || (u.email || '').toLowerCase() === idLower);
        if (!user || user.password !== password) {
            window.alert('Credenciales incorrectas. Tip: usuario demo / contraseña demo');
            return;
        }

        setSession({ username: user.username });
        window.location.href = 'home.html';
    });
}

function initLogout() {
    const logoutLink = document.getElementById('cerrarSesion');
    if (!logoutLink) return;

    logoutLink.addEventListener('click', () => {
        clearSession();
    });
}

function initUserUi() {
    const session = getSession();
    const username = session?.username;

    const welcome = document.getElementById('nombreUsuario');
    if (welcome && username) welcome.textContent = username;

    const dropdownLabel = document.querySelector('.dropdown-button p');
    if (dropdownLabel && username) dropdownLabel.textContent = username;
}

function initCourseTabs() {
    const container = document.querySelector('[data-tabs="curso"]');
    if (!container) return;

    const items = Array.from(container.querySelectorAll('.nav-item'));
    const panels = Array.from(document.querySelectorAll('[data-tab-panel]'));

    const setActive = (tab) => {
        items.forEach((a) => a.classList.toggle('active', a.dataset.tab === tab));
        panels.forEach((p) => {
            const isActive = p.getAttribute('data-tab-panel') === tab;
            if (isActive) p.removeAttribute('hidden');
            else p.setAttribute('hidden', '');
        });
    };

    items.forEach((a) => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = a.dataset.tab;
            if (!tab) return;
            history.replaceState(null, '', a.getAttribute('href') || '#');
            setActive(tab);
        });
    });

    const initialFromHash = (window.location.hash || '').replace('#', '');
    const initial = items.some((a) => a.dataset.tab === initialFromHash) ? initialFromHash : items.find((a) => a.classList.contains('active'))?.dataset.tab;
    if (initial) setActive(initial);
}

function initCoursePurchase() {
    const buyButton = document.querySelector('.btn-comprar');
    if (!buyButton) return;

    buyButton.addEventListener('click', () => {
        const title = document.querySelector('h1')?.textContent?.trim() || 'Curso';
        const purchases = safeJsonParse(localStorage.getItem(STORAGE_KEYS.purchases), []);
        if (!purchases.includes(title)) purchases.push(title);
        localStorage.setItem(STORAGE_KEYS.purchases, JSON.stringify(purchases));

        buyButton.textContent = 'Comprado';
        buyButton.setAttribute('disabled', 'true');
        window.alert('Compra simulada completada.');
    });
}

function initCatalogFilters() {
    const grid = document.querySelector('.cursos-grid');
    const buttons = Array.from(document.querySelectorAll('.filtro-btn'));
    const search = document.querySelector('.input-buscar');

    if (!grid || buttons.length === 0) return;

    const cards = Array.from(grid.querySelectorAll('.curso-card'));

    const apply = () => {
        const active = buttons.find((b) => b.classList.contains('activo'))?.dataset.filter || 'Todos';
        const q = (search?.value || '').trim().toLowerCase();

        cards.forEach((card) => {
            const cat = card.dataset.category || '';
            const name = card.querySelector('.curso-nombre')?.textContent?.toLowerCase() || '';
            const matchesCategory = active === 'Todos' || cat === active;
            const matchesQuery = !q || name.includes(q);
            card.style.display = matchesCategory && matchesQuery ? '' : 'none';
        });
    };

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            buttons.forEach((b) => b.classList.remove('activo'));
            btn.classList.add('activo');
            apply();
        });
    });

    if (search) {
        search.addEventListener('input', apply);
    }

    apply();
}

function initCommunity() {
    const list = document.getElementById('comentariosList');
    const count = document.getElementById('cantNumero');
    const form = document.getElementById('formulario');
    const textarea = document.getElementById('namexd');

    if (!list || !count) return;

    const render = () => {
        const posts = safeJsonParse(localStorage.getItem(STORAGE_KEYS.posts), []);
        list.innerHTML = '';

        posts
            .slice()
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .forEach((post) => {
                const item = document.createElement('div');
                item.className = 'comentario';

                const user = document.createElement('strong');
                const userP = document.createElement('p');
                userP.className = 'user-comentario';
                userP.textContent = post.username || 'usuario';
                user.appendChild(userP);

                const msg = document.createElement('p');
                msg.className = 'message-comentario';
                msg.textContent = post.message || '';

                item.appendChild(user);
                item.appendChild(msg);
                list.appendChild(item);
            });

        count.textContent = String(posts.length);
    };

    if (form && textarea) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = textarea.value.trim();
            if (!message) return;

            const session = getSession();
            const username = session?.username || 'Usuario';

            const posts = safeJsonParse(localStorage.getItem(STORAGE_KEYS.posts), []);
            posts.push({ username, message, createdAt: Date.now() });
            localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(posts));

            textarea.value = '';
            render();
        });
    }

    render();
}

function initAuthGuard() {
    const session = getSession();
    const isPublic = Boolean(
        document.getElementById('loginForm') ||
        document.getElementById('registerForm')
    );
    const requiresAuth = Boolean(
        document.querySelector('aside .list-aside') ||
        document.querySelector('meta[name="requires-auth"]')
    );
    if (isPublic || !requiresAuth) return;
    if (session?.username) return;
    window.location.href = 'login.html';
}

function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.querySelector('#contactName')?.value?.trim() || '';
        const email = form.querySelector('#contactEmail')?.value?.trim() || '';
        const message = form.querySelector('#contactMessage')?.value?.trim() || '';

        if (!name || !email || !message) {
            window.alert('Completa nombre, correo y mensaje.');
            return;
        }

        form.reset();
        window.alert('Mensaje enviado (simulado). Te responderemos pronto.');
    });
}

function initPasswordRecovery() {
    const form = document.getElementById('recoverForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('#recoverEmail')?.value?.trim() || '';
        if (!email) {
            window.alert('Ingresa tu correo.');
            return;
        }

        form.reset();
        window.alert('Si el correo existe, te enviaremos instrucciones (simulado).');
        window.location.href = 'login.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    ensureSeedData();
    initPasswordToggles();
    initRegister();
    initLogin();
    initLogout();
    initAuthGuard();
    initUserUi();
    initCourseTabs();
    initCoursePurchase();
    initCatalogFilters();
    initCommunity();
    initContactForm();
    initPasswordRecovery();
});
