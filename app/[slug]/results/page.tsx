'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { supabase } from '@/lib/supabase';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { Poll, Option, Response } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Loader2, Users, ChartBar, Clock, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; // Import toast

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ResultsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPollData() {
      try {
        const { data: pollData, error: pollError } = await supabase
          .from('polls')
          .select('*')
          .eq('url_slug', slug,)
          .single();

        if (pollError) throw pollError;
        setPoll(pollData);

        const { data: optionsData, error: optionsError } = await supabase
          .from('options')
          .select('*')
          .eq('poll_id', pollData.id);

        if (optionsError) throw optionsError;
        setOptions(optionsData);

        const { data: responsesData, error: responsesError } = await supabase
          .from('responses')
          .select('*')
          .eq('poll_id', pollData.id);

        if (responsesError) throw responsesError;
        setResponses(responsesData);
      } catch (error) {
        console.error('Error fetching poll data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPollData();

    const subscription = supabase
      .channel('responses')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'responses',
          filter: `poll_id=eq.${poll?.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setResponses((current) => [...current, payload.new as Response]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [slug, poll?.id]);

  const handleShare = async () => {
    try {
      const baseUrl = window.location.origin;
      const pollUrl = `${baseUrl}/${slug}`;
      await navigator.clipboard.writeText(pollUrl);
      toast.success('Poll URL copied to clipboard!');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('Failed to copy URL');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading results...</span>
        </div>
      </div>
    );
  }


  if (!poll) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">🤔</div>
          <h1 className="text-2xl font-semibold text-foreground">Poll Not Found</h1>
          <p className="text-muted-foreground">This poll may have been deleted or deactivated.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
  if (poll.show_results === true) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">🤔</div>
          <h1 className="text-2xl font-semibold text-foreground">Results Not Available</h1>
          <p className="text-muted-foreground">The creator of this poll has disabled result sharing.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const optionVotes = options.map(option => ({
    ...option,
    votes: responses.filter(r => r.option_id === option.id).length,
  }));

  const totalVotes = responses.length;

  const chartData = {
    labels: optionVotes.map(opt => opt.option_text),
    datasets: [
      {
        label: 'Votes',
        data: optionVotes.map(opt => opt.votes),
        backgroundColor: 'rgba(147, 51, 234, 0.3)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#64748b',
        },
        grid: {
          color: 'rgba(100, 116, 139, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#64748b',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <div className="bg-card rounded-xl shadow-lg border border-border p-8">
          <div className="space-y-4 mb-6">
            <h1 className="text-3xl font-bold">{poll.question}</h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
                >
                  <Share2 className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Share Poll'}
                </button>
                <button
                  onClick={() => router.push('/create')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <span className="font-medium">Create New Poll</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <Bar data={chartData} options={chartOptions} className="mb-6" />
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              {optionVotes.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-background rounded-lg p-4 border border-border"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{option.option_text}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{option.votes}</span>
                      <span className="text-sm text-muted-foreground">
                        ({totalVotes ? ((option.votes / totalVotes) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${totalVotes ? (option.votes / totalVotes) * 100 : 0}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl shadow-lg border border-border p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Recent Responses</h2>
          </div>
          <div className="space-y-4">
            {responses.slice().reverse().map((response, index) => {
              const option = options.find(o => o.id === response.option_id);
              return (
                <motion.div
                  key={response.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex justify-between items-center p-3 rounded-lg bg-background border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {response.respondent_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium">{response.respondent_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground">{option?.option_text}</span>
                    <span className="text-xs text-muted-foreground/60 ml-2">
                      {new Date(response.submitted_at).toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
