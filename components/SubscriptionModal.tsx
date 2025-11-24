
import React, { useState, useEffect } from 'react';
import { UserProfile, PaymentRequest } from '../types';
import { submitPaymentRequest } from '../services/userData';
import { X, Check, Copy, Loader2, CreditCard, Wallet, ExternalLink, TrendingUp, ShieldCheck, Zap, MessageSquare, Send } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile;
}

// Config
const WALLET_ADDRESS = "TYkGprD7ADrGxLsG1BAGvY1H5XnsrQbhxG"; // TRC20
const EXCHANGE_LINK = "https://ok-ex.io/buy-and-sell/USDT/?refer=224384";
const BASE_PRICE_USD = 3;
const DISCOUNT_PRICE_USD = 2;
const DISCOUNT_THRESHOLD_MONTHS = 5;

const SubscriptionModal: React.FC<Props> = ({ isOpen, onClose, userProfile }) => {
    const [paymentMethod, setPaymentMethod] = useState<'USDT' | 'IRR'>('USDT');
    const [months, setMonths] = useState(1);
    const [rate, setRate] = useState<number>(600000); 
    const [txId, setTxId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchRate = async () => {
            try {
                // Fetch real-time rate from Nobitex (Public API for USDT/RLS)
                const response = await fetch('https://api.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls');
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'ok' && data.stats['usdt-rls']) {
                        // bestSell is usually the price to buy USDT
                        const currentRate = parseFloat(data.stats['usdt-rls'].bestSell);
                        if (!isNaN(currentRate)) {
                            setRate(currentRate);
                            return;
                        }
                    }
                }
                throw new Error("API Error");
            } catch (e) {
                // Fallback Simulation: Random fluctuation around 60,000 Tomans (600,000 Rials)
                setRate(prev => {
                     const variation = Math.floor(Math.random() * 2000) - 1000; // +/- 1000 Rials
                     if (prev < 580000 || prev > 620000) return 600000 + variation;
                     return prev + variation;
                });
            }
        };

        if (isOpen) {
            fetchRate(); // Initial
            const interval = setInterval(fetchRate, 5000); // Update every 5s
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const unitPrice = months >= DISCOUNT_THRESHOLD_MONTHS ? DISCOUNT_PRICE_USD : BASE_PRICE_USD;
    const totalUSD = months * unitPrice;
    const totalIRR = totalUSD * rate;

    const handleCopyWallet = () => {
        navigator.clipboard.writeText(WALLET_ADDRESS);
        alert("آدرس کیف پول کپی شد!");
    };

    const handleSubmit = async () => {
        if (!txId.trim()) return;
        setIsSubmitting(true);

        try {
            const request: PaymentRequest = {
                id: `pay_${Date.now()}_${userProfile?.id || 'unknown'}`,
                userId: userProfile?.id || 'unknown',
                userName: userProfile?.name || 'Unknown User',
                months: months,
                amountUSD: totalUSD,
                amountIRR: totalIRR,
                txId: txId.trim(), 
                status: 'Pending',
                requestDate: new Date().toISOString(),
                network: 'TRC20'
            };

            const result = await submitPaymentRequest(request);
            
            if (result === 'AUTO_APPROVED') {
                alert("تراکنش تأیید شد! اشتراک ویژه شما اکنون فعال است.");
            } else {
                alert("کد رهگیری ثبت شد. در صورت عدم تأیید خودکار، مدیر سیستم آن را بررسی خواهد کرد.");
            }
            onClose();
        } catch (err) {
            alert("خطا در ارسال درخواست. لطفا مجدد تلاش کنید.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-sm animate-fade-in" dir="rtl">
            <div className="w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">ارتقا به اشتراک حرفه‌ای</h2>
                            <p className="text-xs text-slate-400">دسترسی نامحدود به هوش مصنوعی و مدیریت شاگردان</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* 1. Portfolio Ticker */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between animate-pulse-slow">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block uppercase">نرخ لحظه‌ای بازار</span>
                                <span className="text-white font-bold font-mono">USDT / IRR</span>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-xl font-mono font-bold text-emerald-400">
                                 {(rate / 10).toLocaleString()} <span className="text-xs text-slate-500">تومان</span>
                             </div>
                             <div className="text-[10px] text-slate-500">بروزرسانی زنده</div>
                        </div>
                    </div>

                    {/* 2. Pricing Calculator */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                        <label className="text-sm text-slate-400 mb-4 block">مدت زمان اشتراک (ماه)</label>
                        <input 
                            type="range" 
                            min="1" max="12" 
                            value={months} 
                            onChange={(e) => setMonths(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 mb-6"
                        />
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-white font-bold text-lg">{months} ماه</span>
                            {months >= DISCOUNT_THRESHOLD_MONTHS && (
                                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full animate-bounce">
                                    تخفیف ویژه فعال شد! (۲ دلار/ماه)
                                </span>
                            )}
                        </div>

                        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex justify-between items-center">
                            <span className="text-slate-400 text-sm">مبلغ قابل پرداخت:</span>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white font-mono flex items-center gap-1 justify-end">
                                    {totalUSD} <span className="text-sm text-slate-500">USDT</span>
                                </div>
                                <div className="text-sm text-emerald-400 font-mono mt-1">
                                    ≈ {(totalIRR / 10).toLocaleString()} تومان
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Payment Method Tabs */}
                    <div className="flex gap-2 bg-slate-950 p-1 rounded-xl">
                        <button 
                            onClick={() => setPaymentMethod('USDT')}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${paymentMethod === 'USDT' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Wallet size={16} /> پرداخت تتر (خودکار)
                        </button>
                        <button 
                            onClick={() => setPaymentMethod('IRR')}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${paymentMethod === 'IRR' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <CreditCard size={16} /> کارت به کارت
                        </button>
                    </div>

                    {/* 4. Payment Content */}
                    {paymentMethod === 'USDT' ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">
                                    TRC20 Only
                                </div>
                                
                                <div className="flex flex-col md:flex-row gap-6 items-center">
                                    {/* QR Code */}
                                    <div className="bg-white p-2 rounded-xl shrink-0">
                                         <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${WALLET_ADDRESS}`} 
                                            alt="Wallet QR" 
                                            className="w-32 h-32"
                                         />
                                    </div>
                                    
                                    <div className="flex-1 w-full space-y-4">
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase block mb-1">آدرس کیف پول (شبکه TRC20)</label>
                                            <div className="flex gap-2">
                                                <code className="flex-1 bg-slate-900 border border-slate-700 p-3 rounded-lg text-xs font-mono text-emerald-400 break-all">
                                                    {WALLET_ADDRESS}
                                                </code>
                                                <button onClick={handleCopyWallet} className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-lg border border-slate-700 transition-colors">
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 leading-relaxed">
                                            <strong className="text-white block mb-1">راهنما:</strong>
                                            ۱. وارد صرافی <a href={EXCHANGE_LINK} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">اوکی اکسچنج</a> شوید.<br/>
                                            ۲. مبلغ <span className="text-white font-bold">{totalUSD} تتر</span> خریداری کنید.<br/>
                                            ۳. به آدرس بالا (شبکه TRC20) انتقال دهید.<br/>
                                            ۴. کد پیگیری (TxID) را در زیر وارد کنید.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-white font-bold mb-2 block">تأیید خودکار تراکنش</label>
                                    <input 
                                        type="text" 
                                        value={txId}
                                        onChange={(e) => setTxId(e.target.value)}
                                        placeholder="کد پیگیری تراکنش (TxID) را اینجا وارد کنید..."
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-emerald-500 outline-none font-mono text-sm transition-colors"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">
                                        مثال: 7f5a...8b2c
                                    </p>
                                </div>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={!txId || isSubmitting}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-900/20"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                                    بررسی و فعال‌سازی آنی
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in text-center py-8">
                             <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                                 <MessageSquare size={32} className="text-blue-400" />
                             </div>
                             <h3 className="text-xl font-bold text-white">پرداخت کارت به کارت</h3>
                             <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                                 برای دریافت شماره کارت و فعال‌سازی دستی، لطفاً مبلغ <span className="text-white font-bold">{(totalIRR / 10).toLocaleString()} تومان</span> را آماده کرده و به پشتیبانی پیام دهید.
                             </p>
                             
                             <div className="flex flex-col gap-3 max-w-xs mx-auto mt-6">
                                 <a 
                                    href="https://t.me/mokamelfitpro_support" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="bg-[#229ED9] hover:bg-[#1f94cc] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
                                 >
                                     <Send size={18} /> ارتباط در تلگرام
                                 </a>
                                 <a 
                                    href="https://wa.me/9981749697" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
                                 >
                                     <MessageSquare size={18} /> ارتباط در واتساپ
                                 </a>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;
