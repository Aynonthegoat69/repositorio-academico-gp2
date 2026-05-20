// ============================================
// PR INFO - AUTH.JS
// Sistema de Autenticação Simples
// ============================================

// ============================================
// 1. LOGIN
// ============================================
async function login(email, password) {
  console.log('🔐 Login tentando:', email);

  try {
    // Hash da senha
    const passwordHash = await hashPassword(password);

    // Busca usuário na base de dados
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('password_hash', passwordHash)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('❌ Login falhou:', error?.message || 'Usuário não encontrado');
      return { 
        success: false, 
        message: 'Email ou senha inválidos.' 
      };
    }

    // Salva sessão no localStorage
    const userSession = {
      id: data.id,
      name: data.full_name,
      email: data.email,
      role: data.course_role
    };

    localStorage.setItem('prinfo_user', JSON.stringify(userSession));
    localStorage.setItem('prinfo_logged_in', 'true');

    console.log('✅ Login bem-sucedido:', userSession);

    return {
      success: true,
      message: 'Bem-vindo, ' + data.full_name.split(' ')[0] + '!',
      user: userSession
    };

  } catch (err) {
    console.error('❌ Erro no login:', err);
    return { 
      success: false, 
      message: 'Erro de conexão. Verifique sua internet.' 
    };
  }
}

// ============================================
// 2. REGISTO (CRIAR CONTA)
// ============================================
async function register(formData) {
  console.log('📝 Criando conta...', formData);

  // Validação básica
  if (!formData.nome || !formData.email || !formData.password) {
    return { 
      success: false, 
      message: 'Preencha todos os campos obrigatórios.' 
    };
  }

  try {
    // Cria hash da senha
    const passwordHash = await hashPassword(formData.password);

    // Verifica se email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', formData.email.toLowerCase().trim())
      .single();

    if (existingUser) {
      return { 
        success: false, 
        message: 'Este email já está registado.' 
      };
    }

    // Insere novo usuário
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: formData.email.toLowerCase().trim(),
        password_hash: passwordHash,
        full_name: formData.nome.trim(),
        phone: formData.phone || null,
        nif_or_bi: formData.nif || null,
        course_role: formData.curso || 'informatica',
        nomination_year: parseInt(formData.ano) || new Date().getFullYear(),
        is_active: true,
        is_verified: true
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw error;
    }

    // Cria configurações padrão
    await supabase
      .from('user_settings')
      .insert({
        user_id: data.id,
        theme: 'light',
        language: 'pt-AO'
      });

    // Login automático após registo
    const userSession = {
      id: data.id,
      name: data.full_name,
      email: data.email,
      role: data.course_role
    };

    localStorage.setItem('prinfo_user', JSON.stringify(userSession));
    localStorage.setItem('prinfo_logged_in', 'true');

    console.log('✅ Conta criada e login realizado:', userSession);

    return {
      success: true,
      message: 'Conta criada com sucesso!',
      user: userSession
    };

  } catch (err) {
    console.error('❌ Erro no registo:', err);
    return { 
      success: false, 
      message: 'Erro ao criar conta: ' + err.message 
    };
  }
}

// ============================================
// 3. LOGOUT
// ============================================
function logout() {
  console.log('👋 Fazendo logout...');
  localStorage.removeItem('prinfo_user');
  localStorage.removeItem('prinfo_logged_in');
  window.location.href = 'login.html';
}

// ============================================
// 4. VERIFICAR SE ESTÁ LOGADO
// ============================================
function isLoggedIn() {
  const isLogged = localStorage.getItem('prinfo_logged_in') === 'true';
  const user = localStorage.getItem('prinfo_user');
  
  console.log('🔍 isLoggedIn:', isLogged, user ? 'com usuário' : 'sem usuário');
  
  return isLogged && !!user;
}

// ============================================
// 5. OBTER USUÁRIO ATUAL
// ============================================
function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('prinfo_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('❌ Erro ao ler usuário:', e);
    return null;
  }
}

// ============================================
// 6. PROTEGER PÁGINAS (REDIRECIONA SE NÃO LOGADO)
// ============================================
function requireAuth() {
  if (!isLoggedIn()) {
    console.log('⚠️ Usuário não autenticado, redirecionando...');
    window.location.href = 'login.html';
    return false;
  }
  console.log('✅ Usuário autenticado:', getCurrentUser());
  return true;
}

// ============================================
// 7. HASH DE SENHA (SHA-256)
// ============================================
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================
// 8. CONFIRMAÇÃO DE CARREGAMENTO
// ============================================
console.log('✅ auth.js carregado com sucesso!');
console.log('🔐 Funções disponíveis:');
console.log('   - login():', typeof login);
console.log('   - register():', typeof register);
console.log('   - logout():', typeof logout);
console.log('   - isLoggedIn():', typeof isLoggedIn);
console.log('   - getCurrentUser():', typeof getCurrentUser);
console.log('   - requireAuth():', typeof requireAuth);
