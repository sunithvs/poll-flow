'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import type { Poll, Option } from '@/lib/supabase';

export default function VotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchPoll() {
      try {
        // Fetch poll
        const { data: pollData, error: pollError } = await supabase
          .from('polls')
          .select('*')
          .eq('url_slug', slug)
          .single();

        if (pollError) throw pollError;
        if (!pollData) {
          toast.error('Poll not found');
          router.push('/');
          return;
        }

        setPoll(pollData);

        // Fetch options
        const { data: optionsData, error: optionsError } = await supabase
          .from('options')
          .select('*')
          .eq('poll_id', pollData.id);

        if (optionsError) throw optionsError;
        setOptions(optionsData);
      } catch (error) {
        console.error('Error fetching poll:', error);
        toast.error('Failed to load poll');
      } finally {
        setLoading(false);
      }
    }

    fetchPoll();
  }, [slug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poll || !selectedOption || !name.trim()) return;

    setSubmitting(true);
    try {
      // Create session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({})
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Submit response
      const { error: responseError } = await supabase
        .from('responses')
        .insert({
          poll_id: poll.id,
          option_id: selectedOption,
          session_id: sessionData.id,
          respondent_name: name.trim(),
        });

      if (responseError) throw responseError;

      toast.success('Vote submitted successfully!');
      router.push(`/${slug}/results`);
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error('Failed to submit vote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto p-6">Loading...</div>;
  }

  if (!poll || !poll.is_active) {
    return <div className="max-w-2xl mx-auto p-6">Poll not found or inactive</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{poll.question}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Your Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              maxLength={100}
            />
          </label>
        </div>

        <div className="space-y-4">
          {options.map((option) => (
            <label key={option.id} className="flex items-center space-x-3">
              <input
                type="radio"
                name="option"
                value={option.id}
                checked={selectedOption === option.id}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                required
              />
              <span className="text-sm font-medium">{option.option_text}</span>
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Vote'}
        </button>
      </form>
    </div>
  );
}
