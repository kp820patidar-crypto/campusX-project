import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, HeartHandshake, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                Campus<span className="text-indigo-600">X</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Buy smarter. Sell faster. Trade within your campus community. An OLX-style marketplace built exclusively for college students.
            </p>
            <div className="pt-2 text-[11px] text-slate-400">
              Currency: INR (₹) • Tailored for Indian Colleges
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Popular Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/?category=Books+%26+Study+Materials" className="hover:text-indigo-600 transition-colors">
                  Engineering & Arts Books
                </Link>
              </li>
              <li>
                <Link to="/?category=Calculators+%26+Lab+Equipment" className="hover:text-indigo-600 transition-colors">
                  Scientific Calculators & Drafters
                </Link>
              </li>
              <li>
                <Link to="/?category=Electronics" className="hover:text-indigo-600 transition-colors">
                  Keyboards, Mice & Electronics
                </Link>
              </li>
              <li>
                <Link to="/?category=Cycles+%26+Transport" className="hover:text-indigo-600 transition-colors">
                  Campus Cycles & Locks
                </Link>
              </li>
              <li>
                <Link to="/?category=Hostel+Essentials" className="hover:text-indigo-600 transition-colors">
                  Hostel Lamps, Kettles & Racks
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Safety Guidelines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Campus Safety</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <span>Always meet in public campus zones like the library, cafeteria, or hostel foyer.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <span>Test electronic gadgets & calculators before finalizing UPI or cash payment.</span>
              </li>
              <li>Never share private hostel room keys or pay advance tokens.</li>
            </ul>
          </div>

          {/* Academic Submission Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Project Info
            </h4>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <p className="font-semibold text-slate-800">CampusX Full-Stack Project</p>
              <p className="text-[11px] text-slate-500">MERN Stack (MongoDB, Express, React, Node.js)</p>
              <p className="text-[11px] text-slate-500">End-Term Software Engineering Submission</p>
              <div className="pt-1.5 border-t border-slate-200 text-[10px] text-indigo-700 font-medium">
                Production-Ready Architecture
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} CampusX Marketplace. Built for college communities.</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-slate-600">Browse</Link>
            <Link to="/create-listing" className="hover:text-slate-600">Sell</Link>
            <Link to="/messages" className="hover:text-slate-600">Chat</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

