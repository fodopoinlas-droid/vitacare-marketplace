import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Pill, Activity, Calendar, Trophy } from 'lucide-react';
import { CURRENT_USER, HEALTH_TREND_DATA } from '../constants';
import { Button } from '../components/Button';
import { useToast } from '../contexts/ToastContext';

export const Dashboard: React.FC = () => {
  const { addToast } = useToast();

  const handleLogIntake = () => {
    addToast("Logged intake for today! Streak updated.", 'success');
  };

  const handleViewReport = () => {
    addToast("Downloading detailed PDF report...", 'info');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-health-primary to-teal-800 dark:from-teal-900 dark:to-teal-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10">
          <h1 className="font-serif text-3xl font-bold mb-2">Hello, {CURRENT_USER.name}</h1>
          <p className="text-teal-100 mb-6 max-w-xl">You're on a 5-day streak! Your consistency with Vitamin D is improving your sleep metrics.</p>
          <div className="flex gap-4">
            <Button variant="secondary" size="sm" onClick={handleLogIntake}>Log Today's Intake</Button>
            <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/10" onClick={handleViewReport}>View Report</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg flex items-center text-health-text dark:text-white">
              <Activity className="w-5 h-5 text-health-primary mr-2" />
              Wellness Score Trend
            </h2>
            <span className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full font-medium">+4% this week</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HEALTH_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.3} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff'}}
                  cursor={{stroke: '#0A7C8C', strokeWidth: 2}}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0A7C8C" 
                  strokeWidth={3} 
                  dot={{fill: '#0A7C8C', strokeWidth: 2, r: 4, stroke: '#fff'}} 
                  activeDot={{r: 6, fill: '#FF6B35'}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-start">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-health-accent mr-4">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Next Refill</p>
              <p className="font-bold text-lg text-health-text dark:text-white">{CURRENT_USER.nextRefill}</p>
              <p className="text-xs text-health-accent mt-1">Order within 2 days</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-start">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-4">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Upcoming Consult</p>
              <p className="font-bold text-lg text-health-text dark:text-white">Dr. Chen</p>
              <p className="text-xs text-slate-400 mt-1">Thursday, 2:00 PM</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-start">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-4">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Health Goal</p>
              <p className="font-bold text-lg text-health-text dark:text-white">{CURRENT_USER.recommendedFocus}</p>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 mt-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 w-3/4 h-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};