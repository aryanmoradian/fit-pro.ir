
import React, { useState } from 'react';
import { Home, ShoppingCart, BookOpen, Phone, Menu, X, Dumbbell, Sparkles, BrainCircuit, Instagram, MessageCircle, ChevronDown, Users } from 'lucide-react';

interface Props {
  onContactClick: () => void;
}

const Header: React.FC<Props> = ({ onContactClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSocialDropdownOpen, setIsSocialDropdownOpen] = useState(false);

  const navItems = [
    { 
      label: 'خانه', 
      href: 'https://fit-pro.ir', 
      icon: Home 
    },
    { 
      label: 'فرمول بدن (AI Body Formula)', 
      href: 'https://mokamelfitpro.ir', 
      icon: BrainCircuit,
      badge: 'هوش مصنوعی',
      highlight: true 
    },
    { 
      label: 'فروشگاه مکمل پرو', 
      href: 'https://mokamelpro.ir', 
      icon: ShoppingCart 
    },
    { 
      label: 'مجله تخصصی', 
      href: 'https://www.mokamelfitpro.ir/articles/', 
      icon: BookOpen 
    },
  ];

  const socialItems = [
    { 
      label: 'گروه آموزشی واتساپ', 
      href: 'https://chat.whatsapp.com/JkWkKSmtesJ1QID0bgNry7', 
      icon: MessageCircle, 
      color: 'text-[#25D366]' 
    },
    { 
      label: 'اینستاگرام مکمل فیت پرو', 
      href: 'https://instagram.com/mokamel_fitpro', 
      icon: Instagram, 
      color: 'text-[#E1306C]' 
    },
    { 
      label: 'اینستاگرام فیت پرو', 
      href: 'https://instagram.com/fit-pro.ir', 
      icon: Instagram, 
      color: 'text-[#C13584]' 
    },
    { 
      label: 'اینستاگرام جناب صفری', 
      href: 'https://instagram.com/reza_safriii1', 
      icon: Instagram, 
      color: 'text-[#833AB4]' 
    },
    { 
      label: 'اینستاگرام آریان مرادیان', 
      href: 'https://instagram.com/aryan_moradyan', 
      icon: Instagram, 
      color: 'text-[#5851DB]' 
    },
  ];

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 w-full h-20 shadow-lg shadow-emerald-900/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        
        {/* LEFT: Logo & Brand */}
        <div className="flex items-center gap-3">
          <a href="/" className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 transform hover:scale-105 transition-transform">
            <Dumbbell size={20} className="text-white" />
          </a>
          <div className="hidden md:flex flex-col">
            <span className="text-xl font-extrabold text-white tracking-tight leading-none">
              فیت <span className="text-emerald-500">پرو</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold tracking-wide mt-0.5">
              علم، تخصص، نتایج پایدار
            </span>
          </div>
        </div>

        {/* CENTER: Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/50 p-1.5 rounded-full border border-slate-800">
          {navItems.map((item, idx) => (
            <a 
              key={idx}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 group ${
                item.highlight 
                  ? 'bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/40' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon size={16} className={`opacity-70 group-hover:opacity-100 ${item.highlight ? 'animate-pulse' : ''}`} />
              {item.label}
              
              {/* Badge */}
              {item.badge && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[9px] px-1.5 py-0.5 rounded-md shadow-sm animate-bounce">
                  {item.badge}
                </span>
              )}
            </a>
          ))}

          {/* Socials Dropdown */}
          <div className="relative group">
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              onMouseEnter={() => setIsSocialDropdownOpen(true)}
              onClick={() => setIsSocialDropdownOpen(!isSocialDropdownOpen)}
            >
              <Users size={16} />
              جامعه فیت پرو
              <ChevronDown size={14} />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100">
               <div className="p-2 space-y-1">
                 {socialItems.map((social, idx) => (
                   <a
                     key={idx}
                     href={social.href}
                     target="_blank"
                     rel="noreferrer"
                     className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors group/item"
                   >
                     <social.icon size={18} className={`${social.color} group-hover/item:scale-110 transition-transform`} />
                     <span className="text-xs font-bold text-slate-300 group-hover/item:text-white truncate">{social.label}</span>
                   </a>
                 ))}
               </div>
            </div>
          </div>
        </nav>

        {/* RIGHT: Trust & Support Action */}
        <div className="hidden md:flex items-center gap-4">
          {/* Phone Number Display */}
          <div className="flex flex-col items-end">
             <span className="text-[10px] text-slate-400">پشتیبانی مستقیم</span>
             <a href="tel:09981749697" dir="ltr" className="text-emerald-400 font-mono font-bold text-lg leading-none hover:text-emerald-300 transition-colors">
                0998 174 9697
             </a>
          </div>

          <button 
            onClick={onContactClick}
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-orange-900/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Phone size={18} />
            <span>تماس با ما</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 lg:hidden">
           {/* Show simplified support on mobile header */}
           <a href="tel:09981749697" className="md:hidden w-9 h-9 bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20 animate-pulse">
             <Phone size={18} />
           </a>

           <button 
            className="text-slate-300 p-2 hover:bg-slate-800 rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 absolute w-full left-0 top-20 shadow-2xl animate-fade-in z-40 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="flex flex-col p-4 space-y-2">
            
            {/* Main Items */}
            {navItems.map((item, idx) => (
              <a 
                key={idx}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    item.highlight ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/20' : 'text-slate-300 hover:bg-slate-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon size={20} />
                <span className="font-bold">{item.label}</span>
                {item.badge && <span className="mr-auto text-[10px] bg-purple-500 text-white px-2 py-1 rounded-full">{item.badge}</span>}
              </a>
            ))}

            {/* Divider */}
            <div className="border-t border-slate-800 my-2"></div>
            <p className="text-xs text-slate-500 font-bold px-2 uppercase">شبکه‌های اجتماعی</p>

            {/* Social Items (Listed separately as requested) */}
            {socialItems.map((item, idx) => (
              <a 
                key={`social-${idx}`}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon size={20} className={item.color} />
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            ))}
            
            {/* Contact Button */}
            <div className="border-t border-slate-800 my-2 pt-2">
                <button 
                onClick={() => { onContactClick(); setIsMenuOpen(false); }}
                className="flex items-center justify-center gap-3 text-white bg-orange-600 p-3 rounded-xl w-full font-bold shadow-lg"
                >
                <Phone size={20} />
                تماس با پشتیبانی (۰۹۹۸۱۷۴۹۶۹۷)
                </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
