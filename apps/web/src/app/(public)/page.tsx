import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Package, Truck, Smartphone, ShieldCheck, ArrowRight, CheckCircle2,
  MapPin, Clock, Users, Star, BarChart2, Headphones, Globe, Zap
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'ParcelPilot — Fast, Reliable Courier & Logistics in Bangladesh',
  description: 'Bangladesh\'s fastest-growing courier platform. Next-day COD, nationwide delivery, real-time tracking, and API-first integration for modern e-commerce.',
};

const STATS = [
  { value: '2M+', label: 'Parcels Delivered' },
  { value: '15,000+', label: 'Merchants Trust Us' },
  { value: '64', label: 'Districts Covered' },
  { value: '99.2%', label: 'On-Time Rate' },
];

const FEATURES = [
  { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10', title: 'Next-Day COD Payout', desc: 'Get your cash-on-delivery reconciled and transferred within 24 hours. Zero waiting, maximum cashflow.' },
  { icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-500/10', title: 'Real-Time SMS Alerts', desc: 'Automated SMS at every milestone. Keep customers informed and reduce support tickets by 60%.' },
  { icon: Globe, color: 'text-green-500', bg: 'bg-green-500/10', title: 'Nationwide Coverage', desc: 'Hub-and-spoke network across all 64 districts. Inside Dhaka, Suburbs, and beyond — we deliver everywhere.' },
  { icon: BarChart2, color: 'text-purple-500', bg: 'bg-purple-500/10', title: 'Advanced Analytics', desc: 'Track delivery rates, return rates, and revenue trends from a single intuitive dashboard.' },
  { icon: ShieldCheck, color: 'text-teal-500', bg: 'bg-teal-500/10', title: 'Insured Shipments', desc: 'Every parcel is tracked and insured. Rest easy knowing your inventory is protected end-to-end.' },
  { icon: Headphones, color: 'text-rose-500', bg: 'bg-rose-500/10', title: '24/7 Support', desc: 'Dedicated merchant success managers available round-the-clock via chat, phone, and email.' },
];

const STEPS = [
  { step: '01', title: 'Register & Onboard', desc: 'Create your merchant account in minutes. No paperwork, no waiting.' },
  { step: '02', title: 'Book a Parcel', desc: 'Enter recipient details or import via our API/CSV bulk upload.' },
  { step: '03', title: 'We Pick It Up', desc: 'Our rider arrives at your door within the scheduled window.' },
  { step: '04', title: 'Fast Delivery & COD', desc: 'Parcel delivered, COD collected, money in your account next day.' },
];

const TESTIMONIALS = [
  { name: 'Sabbir Ahmed', business: 'Dhaka Fashion Hub', rating: 5, text: 'Switched from Pathao to ParcelPilot 6 months ago. COD payout is consistently next-day. Delivery rate is above 90%. Absolutely recommend.' },
  { name: 'Nusrat Jahan', business: 'BeautyCraft BD', rating: 5, text: 'The dashboard is clean and easy to use. My team tracks all orders in real-time. Customer support is very responsive.' },
  { name: 'Rafiqul Islam', business: 'TechZone Gadgets', rating: 5, text: 'Bulk import feature saves us hours every week. We process 200+ orders daily without any issues. ParcelPilot is our go-to.' },
];

const PRICING = [
  { zone: 'Inside Dhaka', price: '৳60', note: 'Same-day pickup' },
  { zone: 'Dhaka Suburbs', price: '৳100', note: 'Next-day delivery' },
  { zone: 'Outside Dhaka', price: '৳130', note: '2-3 day delivery' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-base-100">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-base-100/95 backdrop-blur-sm border-b border-base-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-content font-black text-sm">PP</span>
            </div>
            <span className="font-bold text-lg text-base-content">ParcelPilot</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-base-content/70">
            <Link href="/track" className="hover:text-primary transition-colors">Track Parcel</Link>
            <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost btn-sm hidden sm:flex">Login</Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              Start Shipping <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-base-200 via-base-100 to-primary/5 py-20 sm:py-28">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-semibold mb-8 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Bangladesh&apos;s Fastest Growing Delivery Network
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-base-content leading-tight mb-6">
              Ship Faster,<br />
              <span className="text-primary">Get Paid Faster</span>
            </h1>

            <p className="text-lg sm:text-xl text-base-content/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Nationwide delivery with next-day COD payouts, real-time tracking, and a powerful merchant dashboard built for Bangladesh&apos;s e-commerce.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <Link href="/register" className="btn btn-primary btn-lg shadow-xl shadow-primary/20">
                Become a Merchant — It&apos;s Free
                <ArrowRight size={20} />
              </Link>
              <Link href="/track" className="btn btn-outline btn-lg bg-base-100">
                <Package size={18} />
                Track a Parcel
              </Link>
            </div>

            {/* Quick track input */}
            <div className="max-w-lg mx-auto bg-base-100 rounded-2xl shadow-xl border border-base-200 p-2 flex items-center gap-2">
              <Package className="text-base-content/30 ml-2 shrink-0" size={20} />
              <input
                type="text"
                placeholder="Enter tracking ID or phone number..."
                className="input input-ghost flex-1 focus:outline-none focus:bg-transparent text-sm h-10"
                readOnly
              />
              <Link href="/track" className="btn btn-primary btn-sm rounded-xl px-5">
                Track
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-primary py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-black text-primary-content mb-1">{s.value}</div>
              <div className="text-sm text-primary-content/70 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-4 sm:px-6 bg-base-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need to scale</h2>
            <p className="text-base-content/60 max-w-xl mx-auto">
              From first-mile pickup to last-mile delivery — ParcelPilot handles the logistics so you can focus on sales.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card bg-base-200 border border-base-300 hover:border-primary/30 hover:shadow-md transition-all group">
                <div className="card-body gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.bg} group-hover:scale-110 transition-transform`}>
                    <f.icon className={f.color} size={24} />
                  </div>
                  <h3 className="font-bold text-lg">{f.title}</h3>
                  <p className="text-base-content/60 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-base-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How ParcelPilot works</h2>
            <p className="text-base-content/60">Go from onboarding to first delivery in under 15 minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {STEPS.map((step, idx) => (
              <div key={step.step} className="relative text-center">
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-base-300 z-0" />
                )}
                <div className="relative z-10 w-16 h-16 rounded-full bg-primary text-primary-content flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-lg shadow-primary/20">
                  {step.step}
                </div>
                <h3 className="font-bold text-base mb-2">{step.title}</h3>
                <p className="text-sm text-base-content/60">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-24 px-4 sm:px-6 bg-base-100">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-base-content/60 mb-8 leading-relaxed">
              No hidden fees, no complicated fuel surcharges. A flat rate plus a 1% COD handling fee — that&apos;s it.
            </p>
            <div className="space-y-4 mb-8">
              {PRICING.map((p) => (
                <div key={p.zone} className="flex items-center justify-between p-4 bg-base-200 rounded-xl border border-base-300">
                  <div>
                    <div className="font-semibold">{p.zone}</div>
                    <div className="text-xs text-base-content/50">{p.note}</div>
                  </div>
                  <div className="text-2xl font-black text-primary">{p.price}</div>
                </div>
              ))}
            </div>
            <Link href="/pricing" className="btn btn-outline btn-primary">
              Calculate exact rates <ArrowRight size={16} />
            </Link>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="card bg-base-200 shadow-2xl border border-base-300">
              <div className="card-body gap-5">
                <h3 className="font-bold text-xl text-center">Start shipping today</h3>
                <p className="text-sm text-center text-base-content/60">Join 15,000+ merchants already using ParcelPilot</p>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="form-control">
                    <input type="text" placeholder="Your business name" className="input input-bordered w-full" />
                  </div>
                  <div className="form-control">
                    <input type="tel" placeholder="Phone: 01XXXXXXXXX" className="input input-bordered w-full" />
                  </div>
                  <Link href="/register" className="btn btn-primary w-full mt-2">
                    Create Free Account <ArrowRight size={16} />
                  </Link>
                  <p className="text-xs text-center text-base-content/40">No credit card required. Free to start.</p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-4 sm:px-6 bg-base-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Trusted by thousands of merchants</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
                <div className="card-body gap-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-base-content/70 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-base-200">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-base-content/50">{t.business}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 px-4 sm:px-6 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-primary-content mb-6">
            Ready to grow your business?
          </h2>
          <p className="text-primary-content/80 text-lg mb-8">
            Join Bangladesh&apos;s most trusted courier network. Start shipping in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="btn btn-lg bg-base-100 text-primary hover:bg-base-200 border-0 shadow-xl">
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn btn-lg btn-outline text-primary-content border-primary-content/40 hover:bg-primary-content/10">
              Already a merchant? Login
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-base-content text-base-100/80 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-content font-black text-sm">PP</span>
                </div>
                <span className="font-bold text-lg text-base-100">ParcelPilot</span>
              </div>
              <p className="text-sm opacity-60 leading-relaxed">Bangladesh&apos;s fastest growing courier & logistics platform for modern e-commerce businesses.</p>
            </div>
            <div>
              <h4 className="font-semibold text-base-100 mb-4">Company</h4>
              <ul className="space-y-2 text-sm opacity-60">
                <li><a href="#" className="hover:opacity-100 transition-opacity">About Us</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Careers</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Press</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-base-100 mb-4">Merchants</h4>
              <ul className="space-y-2 text-sm opacity-60">
                <li><Link href="/register" className="hover:opacity-100 transition-opacity">Get Started</Link></li>
                <li><Link href="/pricing" className="hover:opacity-100 transition-opacity">Pricing</Link></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">API Docs</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-base-100 mb-4">Track & Ship</h4>
              <ul className="space-y-2 text-sm opacity-60">
                <li><Link href="/track" className="hover:opacity-100 transition-opacity">Track Parcel</Link></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Calculate Rates</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Coverage Areas</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">FAQs</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-base-100/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm opacity-50">
            <p>© 2026 ParcelPilot. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:opacity-100">Privacy Policy</a>
              <a href="#" className="hover:opacity-100">Terms of Service</a>
              <a href="#" className="hover:opacity-100">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
