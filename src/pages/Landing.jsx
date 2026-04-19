import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { BookOpen, PieChart, LayoutDashboard, BrainCircuit } from 'lucide-react';

const features = [
  {
    title: 'Daily Reflection',
    description: 'Log your mood, study hours, and thoughts in a clean, distraction-free interface.',
    icon: BookOpen,
  },
  {
    title: 'Mood Insights',
    description: 'Track your emotional journey over time and identify patterns that affect your wellbeing.',
    icon: BrainCircuit,
  },
  {
    title: 'Productivity Dashboard',
    description: 'Visualize your progress with beautiful charts and maintain your daily streaks.',
    icon: LayoutDashboard,
  },
  {
    title: 'Smart Suggestions',
    description: 'Get tailored recommendations based on your data to improve your daily routine.',
    icon: PieChart,
  },
];

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white"></div>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Selfloom</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/auth')}>Login</Button>
          <Button onClick={() => navigate('/auth?mode=signup')}>Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-6 md:px-12 text-center max-w-4xl mx-auto">
        <div className="inline-block px-4 py-1.5 rounded-full bg-primary-light text-primary text-sm font-semibold tracking-wide mb-6">
          Understand Yourself Within
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
          A smart personal reflection system.
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Selfloom helps you understand your mood, track your productivity, and analyze daily patterns through beautiful insights.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" onClick={() => navigate('/auth?mode=signup')} className="w-full sm:w-auto px-8">
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="w-full sm:w-auto px-8">
            Login
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Discover Your Patterns</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Everything you need to step back, reflect, and improve your daily life.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-6 text-primary">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-gray-100 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Selfloom. All rights reserved.</p>
      </footer>
    </div>
  );
};
