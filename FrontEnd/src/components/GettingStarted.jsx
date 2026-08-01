
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function GettingStarted() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('product');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };


  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.group, section h2, .p-10').forEach(el => {
      el.classList.add('transition-all', 'duration-1000', 'opacity-0', 'translate-y-10');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);


  return (
    <div className="bg-background font-body-md text-on-surface flex flex-col min-h-screen">
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%) translateX(-50%); }
          50% { transform: translateY(0) translateX(-50%); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
          left: 50%;
        }
      `}</style>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/70 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 max-w-container-max mx-auto px-4 md:px-margin-desktop flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img alt="Logo" className="h-20 md:h-40 w-auto object-contain" src={logo} />
          </div>
          <nav className="hidden lg:flex items-center gap-gutter">
            <a className={`transition-colors cursor-pointer ${activeSection === 'product' ? 'text-primary font-bold' : 'font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface'}`} onClick={() => scrollToSection('product')}>
              Product
            </a>
            <a className={`transition-colors cursor-pointer ${activeSection === 'features' ? 'text-primary font-bold' : 'font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface'}`} onClick={() => scrollToSection('features')}>
              Features
            </a>
            <a className={`transition-colors cursor-pointer ${activeSection === 'technology' ? 'text-primary font-bold' : 'font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface'}`} onClick={() => scrollToSection('technology')}>
              Technology
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="bg-primary text-on-primary font-label-sm text-label-sm px-4 py-2 md:px-6 md:py-2.5 rounded-full hover:shadow-lg transition-all text-[11px] md:text-label-sm" onClick={() => navigate("/register")}>
              Get Started
            </button>
            {/* Hamburger Menu Button - visible on mobile/tablet */}
            <button className="lg:hidden w-10 h-10 rounded-full bg-surface-container flex items-center justify-center" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span className="material-symbols-outlined text-on-surface text-[24px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-surface/95 backdrop-blur-2xl border-t border-outline-variant/20 shadow-lg animate-[slideDown_0.2s_ease-out]">
            <div className="max-w-container-max mx-auto px-4 py-4 flex flex-col gap-1">
              {[{id: 'product', label: 'Product'}, {id: 'features', label: 'Features'}, {id: 'technology', label: 'Technology'}].map(item => (
                <a key={item.id} className={`px-4 py-3 rounded-xl cursor-pointer transition-all ${activeSection === item.id ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`} onClick={() => scrollToSection(item.id)}>
                  {item.label}
                </a>
              ))}
              <hr className="border-outline-variant/20 my-2" />
              <button className="w-full bg-primary text-on-primary font-label-sm text-label-sm px-6 py-3 rounded-xl hover:shadow-lg transition-all" onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}>
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </header>
      <main className="pt-20 flex-grow"><div className="flex flex-col w-full">
        {/* Hero Section: Immersive Glassmorphic Start */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden px-4 md:px-margin-desktop bg-surface">
          {/* Ambient Background Elements */}
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]"></div>
          <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center relative z-10">
            <div className="lg:col-span-6 flex flex-col gap-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full w-fit">
                <span className="material-symbols-outlined text-[16px]">magic_button</span>
                <span className="font-label-sm text-label-sm uppercase tracking-widest">Next-Gen Wealth Management</span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface leading-[1.1] tracking-tighter">
                Take Control of Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Money with AI Intelligence</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                The intelligent layer for modern financial growth. Automatically track every penny, receive AI-driven investment insights, and optimize your spending with a digital CFO that lives in your pocket.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button className="bg-primary text-on-primary font-label-sm text-label-sm px-8 py-4 rounded-xl shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center gap-2 group duration-1000 opacity-100 translate-y-0" onClick={() => navigate("/register")}>
                  Get Started Free
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>

              </div>
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div>
                  <div className="font-headline-md text-primary">80%</div>
                  <div className="font-label-sm text-on-surface-variant uppercase">Faster Entry</div>
                </div>
                <div>
                  <div className="font-headline-md text-secondary">100+</div>
                  <div className="font-label-sm text-on-surface-variant uppercase">AI Insights</div>
                </div>
                <div>
                  <div className="font-headline-md text-on-surface">24/7</div>
                  <div className="font-label-sm text-on-surface-variant uppercase">Monitoring</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl bg-surface-container-lowest p-2 border border-outline-variant/20">
                <img alt="SpendSense Dashboard Preview" className="w-full h-auto rounded-[1.8rem] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7VpXdo990E0h-oRrWx16Db3TYhTozxv_PSWoTz0rTfsR9TJ1GdC1uAc2q5Xbya9Zgx7-WKmtR4t51oob8j1qMq6SFeCmXZGtgTzLxuaLzx1BAgIKBfCLMIrws-StVVqbo0M5kiEZMQL5J0daBMrEPd_BUq9QaA7pdHOMv441j3BO3bbkPhQsV5v_xPnGJ_a3_M249gl6lRQ0tewMtvI3zO6ou7RPAdKCmRm5b5CYEJN8eUDWmcwvcEg" />
                {/* Floating Glass Card Micro-Interaction */}
                <div className="absolute bottom-12 -left-12 p-6 rounded-2xl bg-surface/80 backdrop-blur-xl shadow-2xl border border-white/40 hidden xl:block animate-bounce-slow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">trending_up</span>
                    </div>
                    <div>
                      <p className="font-label-sm text-on-surface-variant uppercase">Savings Insight</p>
                      <p className="font-headline-md text-on-surface">+$420.50 <span className="text-label-sm font-label-sm text-primary">this month</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Features Section: Glassmorphic Bento Grid */}
        <section id="features" className="py-16 md:py-24 px-4 md:px-margin-desktop bg-surface-container-lowest">
          <div className="max-w-container-max mx-auto">
            <div className="flex flex-col items-center text-center gap-4 mb-16">
              <h2 className="font-headline-lg text-headline-lg text-on-surface transition-all duration-1000 opacity-100 translate-y-0">Intelligent Features for Modern Finance</h2>
              <p className="text-on-surface-variant max-w-2xl">A suite of tools designed to automate the mundane and highlight the opportunities in your personal economy.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {/* Card 1 */}
              <div className="group p-8 rounded-3xl bg-surface-container-low hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 border border-transparent hover:border-primary/10 duration-1000 opacity-100 translate-y-0">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">psychology</span>
                </div>
                <h3 className="font-headline-md text-on-surface mb-3">AI Financial Assistant</h3>
                <p className="text-on-surface-variant">Personalized natural language advice for complex financial queries and daily spending habits.</p>
              </div>
              {/* Card 2 */}
              <div className="group p-8 rounded-3xl bg-surface-container-low hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 border border-transparent hover:border-primary/10 duration-1000 opacity-100 translate-y-0">
                <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">document_scanner</span>
                </div>
                <h3 className="font-headline-md text-on-surface mb-3">Smart Receipt Scanner</h3>
                <p className="text-on-surface-variant">Snap a photo and let our OCR engine extract line items, taxes, and categories with 99.9% accuracy.</p>
              </div>
              {/* Card 3 */}
              <div className="group p-8 rounded-3xl bg-surface-container-low hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 border border-transparent hover:border-primary/10 duration-1000 opacity-100 translate-y-0">
                <div className="w-14 h-14 bg-tertiary/10 text-tertiary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">health_and_safety</span>
                </div>
                <h3 className="font-headline-md text-on-surface mb-3">Financial Health Score</h3>
                <p className="text-on-surface-variant">Real-time health pulse based on your debt-to-income ratio, savings rate, and spending volatility.</p>
              </div>
              {/* Card 4 */}
              <div className="group p-8 rounded-3xl bg-surface-container-low hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 border border-transparent hover:border-primary/10 duration-1000 opacity-100 translate-y-0">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">insights</span>
                </div>
                <h3 className="font-headline-md text-on-surface mb-3">AI Savings Insights</h3>
                <p className="text-on-surface-variant">Predictive modeling that identifies upcoming surplus cash and suggests optimal placement for growth.</p>
              </div>
              {/* Card 5 */}
              <div className="group p-8 rounded-3xl bg-surface-container-low hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 border border-transparent hover:border-primary/10 duration-1000 opacity-100 translate-y-0">
                <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">call_split</span>
                </div>
                <h3 className="font-headline-md text-on-surface mb-3">Expense Splitting</h3>
                <p className="text-on-surface-variant">Seamlessly split group dinners or shared rent with automated reminders and instant settlements.</p>
              </div>
              {/* Card 6 */}
              <div className="group p-8 rounded-3xl bg-surface-container-low hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 border border-transparent hover:border-primary/10 duration-1000 opacity-100 translate-y-0">
                <div className="w-14 h-14 bg-tertiary/10 text-tertiary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">currency_exchange</span>
                </div>
                <h3 className="font-headline-md text-on-surface mb-3">Multi-Currency Support</h3>
                <p className="text-on-surface-variant">Manage global assets and travel spending with real-time conversion and local market insights.</p>
              </div>
            </div>
          </div>
        </section>
        {/* Product Showcase: Asymmetric Interaction */}
        <section id="product" className="py-24 bg-surface overflow-hidden">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 flex flex-col gap-8">
                <div className="font-label-sm text-primary uppercase tracking-[0.2em]">The Platform</div>
                <h2 className="font-display-lg text-display-lg text-on-surface transition-all duration-1000 opacity-100 translate-y-0">Experience Visual Clarity in Every Transaction</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant">Our dashboard isn't just a list of numbers. It's a high-definition map of your financial life, designed to reveal patterns you never knew existed.</p>
                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white shadow-sm border border-outline-variant/30">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <div>
                      <p className="font-headline-md text-on-surface text-[18px]">Unified Dashboard</p>
                      <p className="text-on-surface-variant">See all accounts, crypto wallets, and assets in one single pane of glass.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white shadow-sm border border-outline-variant/30">
                    <span className="material-symbols-outlined text-secondary">analytics</span>
                    <div>
                      <p className="font-headline-md text-on-surface text-[18px]">Deep Analytics</p>
                      <p className="text-on-surface-variant">Predictive cash flow modeling shows you where you'll be in 6 months.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 relative h-[500px]">
                {/* Interactive Glass Card Layers */}
                <div className="absolute top-0 right-0 w-[80%] aspect-video bg-surface-container rounded-3xl shadow-2xl z-10 overflow-hidden transform hover:-translate-y-2 transition-transform duration-700">
                  <img className="w-full h-full object-cover" data-alt="A futuristic dark-themed analytics dashboard with neon emerald charts, floating data points, and a sleek glassmorphic sidebar showing transaction history." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzZ1eDgfNVi1w8-KJjuWKpkKCxnHsYncym-EUfKe0T_hkPh9iUOqxHyPCZ_BWLvqV6fmZzbaaewcKSjmju7WHIDtVPDAdUGc6q1kIz8t2BvUE20Ga6I3MPw5onxo0gW2Hv1TzgJUFCeARkdhK-A2HFnG8LbWI6Za84wzIFuUxCOyMR2e-q60lQdwDsiZrntuSm8rgckBrJLh2_S39r8564tV79UVJfwoOQ0cddCSkCm4RlJ5HIuCF_nA" />
                </div>
                <div className="absolute bottom-10 left-0 w-[70%] aspect-square bg-white/40 backdrop-blur-2xl rounded-3xl shadow-xl z-20 border border-white/50 p-8 transform -rotate-3 hover:rotate-0 transition-all duration-700">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="font-headline-md text-on-surface">Weekly Budget</span>
                      <span className="text-primary font-bold">85% spent</span>
                    </div>
                    <div className="h-4 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[85%] animate-pulse"></div>
                    </div>
                    <div className="flex flex-col gap-3 mt-4">
                      <div className="flex justify-between text-on-surface-variant font-label-sm uppercase">
                        <span className="">Groceries</span>
                        <span className="">$120.00 / $150.00</span>
                      </div>
                      <div className="flex justify-between text-on-surface-variant font-label-sm uppercase">
                        <span className="">Dining Out</span>
                        <span className="">$240.00 / $200.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* How It Works: Visual Process */}
        <section id="how-it-works" className="py-16 md:py-24 bg-surface-container-low px-4 md:px-margin-desktop">
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display-lg text-on-surface mb-4 transition-all duration-1000 opacity-100 translate-y-0">Financial Mastery in 3 Steps</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 -translate-y-1/2 z-0"></div>
              <div className="relative z-10 flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 bg-primary text-on-primary rounded-full flex items-center justify-center font-display-lg shadow-xl shadow-primary/30">1</div>
                <div className="flex flex-col gap-2">
                  <h4 className="font-headline-md text-on-surface">Track</h4>
                  <p className="text-on-surface-variant">Connect your accounts in seconds with enterprise-grade AES-256 encryption.</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 bg-primary text-on-primary rounded-full flex items-center justify-center font-display-lg shadow-xl shadow-primary/30">2</div>
                <div className="flex flex-col gap-2">
                  <h4 className="font-headline-md text-on-surface">Analyze</h4>
                  <p className="text-on-surface-variant">Our AI engines categorize and tag every transaction, identifying waste and wealth potential.</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 bg-primary text-on-primary rounded-full flex items-center justify-center font-display-lg shadow-xl shadow-primary/30">3</div>
                <div className="flex flex-col gap-2">
                  <h4 className="font-headline-md text-on-surface">Improve</h4>
                  <p className="text-on-surface-variant">Receive actionable advice and automated rules that help you reach your goals faster.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Metrics & Impact */}
        <section className="py-16 md:py-24 px-4 md:px-margin-desktop bg-white">
          <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="grid grid-cols-2 gap-8">
              <div className="p-10 rounded-3xl bg-surface-container-lowest shadow-sm flex flex-col gap-2 transition-all duration-1000 opacity-100 translate-y-0">
                <div className="font-display-lg text-primary">80%</div>
                <p className="text-on-surface-variant font-label-sm uppercase leading-tight">Reduction in manual <br /> data entry</p>
              </div>
              <div className="p-10 rounded-3xl bg-primary text-on-primary shadow-xl flex flex-col gap-2 transform translate-y-8 transition-all duration-1000 opacity-100 translate-y-0">
                <div className="font-display-lg">$2.4k</div>
                <p className="text-on-primary/80 font-label-sm uppercase leading-tight">Avg. annual savings <br /> per active user</p>
              </div>
              <div className="p-10 rounded-3xl bg-surface-container-lowest shadow-sm flex flex-col gap-2 transition-all duration-1000 opacity-100 translate-y-0">
                <div className="font-display-lg text-on-secondary-fixed-variant">1M+</div>
                <p className="text-on-surface-variant font-label-sm uppercase leading-tight">Transactions tracked <br /> every single day</p>
              </div>
              <div className="p-10 rounded-3xl bg-surface-container-lowest shadow-sm flex flex-col gap-2 transform translate-y-8 transition-all duration-1000 opacity-100 translate-y-0">
                <div className="font-display-lg text-tertiary">4.9/5</div>
                <p className="text-on-surface-variant font-label-sm uppercase leading-tight">User rating across <br /> major app stores</p>
              </div>
            </div>
            <div className="flex flex-col gap-8">
              <h2 className="font-display-lg text-on-surface transition-all duration-1000 opacity-100 translate-y-0">Real Impact, Quantified.</h2>
              <p className="font-body-lg text-on-surface-variant">We don't just help you see your money; we help you keep it. Our algorithmic insights are designed to find the leaks in your budget and plug them before you even notice.</p>
              <hr className="border-outline-variant/30" />
              <blockquote className="italic text-on-surface font-body-lg">
                "SpendSense saved me $400 in the first month just by identifying subscriptions I forgot I had. The AI chat feels like talking to a very smart financial advisor."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-dim overflow-hidden">
                  <img className="w-full h-full object-cover" data-alt="Headshot of a smiling professional woman in her early 30s, clear background, high quality studio lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-nvzPLS0uHdonZeXYatdGc-MIJLXzW2HRjnMoMdUzs3poTOnFAk4L1KSTyd38a9rrUkNkOQI37z7Q7RwrlNWNK9RKlqI1NLuRW2wa-Bj-dv0wFjIGKRZ_7oM5jeK4NMm4XIWXfjH8WA4ufhNHPLx57dEmCmA0SSJHZhLoa7wqbtFKNbiEmZPI2r7GlrBSnFpjobeMcKAyX913ShGHhgazWUBGjRR3x-_NnB638XY0G_BoHVC3g_WA9w" />
                </div>
                <div>
                  <p className="font-label-sm text-on-surface">Sarah Jenkins</p>
                  <p className="text-[12px] text-on-surface-variant">Product Designer at TechFlow</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Technology Stack: Elegant Logo Wall */}
        <section id="technology" className="py-16 bg-surface-container-low border-y border-outline-variant/10">
          <div className="max-w-container-max mx-auto px-margin-desktop text-center">
            <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-10">Built with cutting-edge technology</p>
            <div className="flex flex-wrap justify-center items-center gap-16 opacity-50 grayscale hover:grayscale-0 transition-all">
              {/* SVG Placeholders for Tech Logos */}
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">integration_instructions</span>
                <span className="font-headline-md text-[20px]">React</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface">terminal</span>
                <span className="font-headline-md text-[20px]">Node.js</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">neurology</span>
                <span className="font-headline-md text-[20px]">Groq LLM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">database</span>
                <span className="font-headline-md text-[20px]">MongoDB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">palette</span>
                <span className="font-headline-md text-[20px]">Tailwind CSS</span>
              </div>
            </div>
          </div>
        </section>
        {/* CTA Section: High-End Conclusion */}
        <section className="py-16 md:py-32 px-4 md:px-margin-desktop relative overflow-hidden">
          <div className="absolute inset-0 bg-on-background"></div>
          {/* Decorative Shader Element */}

          <div className="max-w-container-max mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 flex flex-col gap-6 text-on-primary">
              <h2 className="font-display-lg text-display-lg leading-tight transition-all duration-1000 opacity-100 translate-y-0">Ready to Transform Your Financial Future?</h2>
              <p className="text-body-lg text-on-primary/70">Join 50,000+ users who are already outperforming the market with AI insights.</p>
              <div className="flex items-center gap-4 mt-4">
                <button className="bg-primary text-on-primary font-label-sm text-label-sm px-10 py-5 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all shadow-2xl" onClick={() => navigate("/register")}>Start Your Journey</button>

              </div>
            </div>
            <div className="lg:w-1/3 aspect-[4/3] bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 p-8 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/60 font-label-sm uppercase">Current Portfolio</p>
                  <p className="text-white font-display-lg">$142,850.00</p>
                </div>
                <div className="px-3 py-1 bg-primary/20 text-primary rounded-full text-label-sm">+12.4%</div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="h-1 bg-white/10 rounded-full w-full overflow-hidden">
                  <div className="h-full bg-primary w-2/3"></div>
                </div>
                <div className="flex justify-between text-white/40 text-[12px] uppercase">
                  <span className="">Progress to Goal</span>
                  <span className="">$200,000.00</span>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">arrow_back_ios_new</span>
                <p className="text-white/80 text-[14px]">AI suggests moving $5k to high-yield savings to earn $250 more annually.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      </main><footer className="bg-surface-container-low py-10 md:py-16 border-t border-outline-variant"><div className="max-w-container-max mx-auto px-4 md:px-margin-desktop flex flex-col gap-8 md:gap-12"><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-12"><div className="col-span-2 lg:col-span-2 flex flex-col gap-4"><div className="flex items-center gap-2"><img alt="Logo" className="h-14 w-auto object-contain" src={logo} /></div><p className="text-body-md text-on-surface-variant max-w-xs">The intelligent layer for modern financial growth and spend management.</p></div><div className="flex flex-col gap-4"><h4 className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">Solutions</h4><a className="text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => { e.preventDefault(); }}>Enterprise</a><a className="text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => { e.preventDefault(); }}>Startups</a><a className="text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => { e.preventDefault(); }}>SaaS</a></div><div className="flex flex-col gap-4"><h4 className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">Company</h4><a className="text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => { e.preventDefault(); }}>About Us</a><a className="text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => { e.preventDefault(); }}>Careers</a><a className="text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => { e.preventDefault(); }}>Press</a></div><div className="flex flex-col gap-4"><h4 className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">Support</h4><a className="text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => { e.preventDefault(); }}>Help Center</a><a className="text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => { e.preventDefault(); }}>Contact</a><a className="text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => { e.preventDefault(); }}>Legal</a></div></div><div className="pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4"><div className="text-label-sm text-on-surface-variant">© 2024 SpendSense. All rights reserved.</div><div className="flex items-center gap-6"><span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">hub</span><span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">share</span><span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">alternate_email</span></div></div></div></footer>


    </div>
  );
}
