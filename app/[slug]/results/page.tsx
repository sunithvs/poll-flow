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
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPollData() {
      try {
        // Fetch poll
        const { data: pollData, error: pollError } = await supabase
          .from('polls')
          .select('*')
          .eq('url_slug', slug)
          .single();

        if (pollError) throw pollError;
        setPoll(pollData);

        // Fetch options
        const { data: optionsData, error: optionsError } = await supabase
          .from('options')
          .select('*')
          .eq('poll_id', pollData.id);

        if (optionsError) throw optionsError;
        setOptions(optionsData);

        // Fetch responses
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

    // Set up real-time subscription
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

  if (loading) {
    return <div className="max-w-2xl mx-auto p-6">Loading...</div>;
  }

  if (!poll) {
    return <div className="max-w-2xl mx-auto p-6">Poll not found</div>;
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
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
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
        display: true,
        text: 'Poll Results',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{poll.question}</h1>

      <div className="mb-8">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Results Breakdown</h2>
        <div className="space-y-4">
          {optionVotes.map(option => (
            <div key={option.id} className="flex justify-between items-center">
              <span>{option.option_text}</span>
              <div className="text-right">
                <span className="font-medium">{option.votes}</span>
                <span className="text-gray-500 ml-2">
                  ({totalVotes ? ((option.votes / totalVotes) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right">
          <span className="font-medium">Total Votes: {totalVotes}</span>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Responses</h2>
        <div className="space-y-2">
          {responses.slice().reverse().map(response => {
            const option = options.find(o => o.id === response.option_id);
            return (
              <div key={response.id} className="flex justify-between items-center text-sm">
                <span className="font-medium">{response.respondent_name}</span>
                <div className="text-right">
                  <span className="text-gray-600">{option?.option_text}</span>
                  <span className="text-gray-400 ml-2">
                    {new Date(response.submitted_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
