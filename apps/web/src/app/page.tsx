import type { Metadata } from 'next';
import Link from 'next/link';
import { Package, Truck, Smartphone, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ParcelPilot - Reliable Courier & Logistics in Bangladesh',
  description: 'Fast, secure, and reliable nationwide delivery with next-day COD payouts. Partner with ParcelPilot today.',
  openGraph: {
    title: 'ParcelPilot - Courier & Logistics Platform',
    description: 'Fast, secure, and reliable nationwide delivery with next-day COD payouts.',
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="hero min-h-[70vh] bg-base-200" style={{ backgroundImage: 'linear-gradient(to bottom right, hsl(var(--b2)), hsl(var(--b1)))' }}>
        <div className="hero-content text-center py-20 px-4">
          <div className="max-w-3xl">
            <div className="badge badge-primary badge-outline mb-6 p-3 text-sm font-bold shadow-sm">
              <span className="animate-pulse mr-2 h-2 w-2 bg-primary rounded-full inline-block"></span>
              Bangladesh's Fastest Growing Delivery Network
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-base-content mb-6 leading-tight">
              Logistics designed for <span className="text-primary block sm:inline">Modern Commerce</span>
            </h1>
            <p className="text-lg sm:text-xl text-base-content/80 mb-10 max-w-2xl mx-auto">
              Nationwide delivery, industry-leading 24-hour COD reconciliation, and a transparent API-first platform. Built for merchants who demand more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="btn btn-primary btn-lg shadow-lg">
                Become a Merchant
                <ArrowRight size={20} />
              </Link>
              <Link href="/track" className="btn btn-outline btn-neutral btn-lg bg-base-100 shadow-md">
                Track a Parcel
              </Link>
            </div>
            
            {/* Quick Tracking input snippet */}
            <div className="mt-12 max-w-lg mx-auto bg-base-100 p-2 pl-4 rounded-full shadow-lg flex items-center border border-base-300">
              <Package className="text-base-content/40 mr-2" size={24} />
              <input 
                type="text" 
                placeholder="Enter your tracking ID (e.g. 12345678)" 
                className="input input-ghost w-full focus:outline-none focus:bg-transparent"
              />
              <Link href="/track" className="btn btn-primary btn-sm rounded-full px-6">
                Track
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-8 bg-base-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why choose ParcelPilot?</h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">
              We handle the complexity of nationwide logistics so you can focus on growing your business.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card bg-base-200 shadow-sm border border-base-300 hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="bg-primary/10 w-14 h-14 rounded-box flex items-center justify-center mb-4 text-primary">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="card-title text-xl">Next-Day COD</h3>
                <p className="text-base-content/70 text-sm">
                  Get your cash-on-delivery payments reconciled and deposited within 24 hours. No more waiting.
                </p>
              </div>
            </div>
            
            <div className="card bg-base-200 shadow-sm border border-base-300 hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="bg-secondary/10 w-14 h-14 rounded-box flex items-center justify-center mb-4 text-secondary">
                  <Smartphone size={32} />
                </div>
                <h3 className="card-title text-xl">Real-Time SMS</h3>
                <p className="text-base-content/70 text-sm">
                  Automated SMS updates at every milestone, keeping your customers informed and reducing support calls.
                </p>
              </div>
            </div>
            
            <div className="card bg-base-200 shadow-sm border border-base-300 hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="bg-accent/10 w-14 h-14 rounded-box flex items-center justify-center mb-4 text-accent">
                  <Truck size={32} />
                </div>
                <h3 className="card-title text-xl">Nationwide Network</h3>
                <p className="text-base-content/70 text-sm">
                  From Dhaka to the most remote Upazilas, our hub-and-spoke network guarantees secure delivery.
                </p>
              </div>
            </div>
            
            <div className="card bg-base-200 shadow-sm border border-base-300 hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="bg-info/10 w-14 h-14 rounded-box flex items-center justify-center mb-4 text-info">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="card-title text-xl">API Integration</h3>
                <p className="text-base-content/70 text-sm">
                  Seamlessly connect your WooCommerce, Shopify, or custom backend directly to our dispatch system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 px-4 sm:px-8 bg-base-200">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Simple, transparent pricing.</h2>
            <p className="text-lg text-base-content/80 mb-6">
              No hidden fees, no complicated fuel surcharges. You pay a flat base rate plus a small COD handling fee.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-success" size={24} />
                <span>Inside Dhaka from <strong className="text-primary text-xl">৳60</strong></span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-success" size={24} />
                <span>Suburbs from <strong className="text-primary text-xl">৳100</strong></span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-success" size={24} />
                <span>Outside Dhaka from <strong className="text-primary text-xl">৳130</strong></span>
              </li>
            </ul>
            <Link href="/pricing" className="btn btn-primary btn-outline">
              Calculate Exact Rates
            </Link>
          </div>
          
          <div className="md:w-1/2 w-full">
            <div className="card bg-base-100 shadow-2xl p-6 sm:p-8 border border-base-300">
              <h3 className="text-xl font-bold mb-6 text-center">Ready to scale your business?</h3>
              <form className="space-y-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Business Name</span></label>
                  <input type="text" className="input input-bordered w-full" placeholder="Your e-commerce shop" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Phone Number</span></label>
                  <input type="tel" className="input input-bordered w-full" placeholder="01XXXXXXXXX" />
                </div>
                <button type="button" className="btn btn-primary w-full mt-4">
                  Request Merchant Account
                </button>
                <p className="text-xs text-center text-base-content/50 mt-4">
                  By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
