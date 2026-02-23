export const auth = {
  key: 'arqura_auth',
  users: [
    { email:'admin@arqura.co', pass:'admin123', name:'Arqura Admin', role:'admin' }
  ],
  save(session){ localStorage.setItem(this.key, JSON.stringify(session||null)); },
  load(){ try{ return JSON.parse(localStorage.getItem(this.key)||'null'); }catch{ return null; } },
  login(email, pass){
    const u = this.users.find(x=>x.email===email && x.pass===pass);
    if(!u) return null;
    const session = { name:u.name, email:u.email, role:u.role };
    this.save(session); return session;
  },
  logout(){ this.save(null); }
};
