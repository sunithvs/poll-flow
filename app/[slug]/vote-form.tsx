'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import type { Poll, Option } from '@/lib/supabase';

type VoteFormProps = {
  poll: Poll;
  options: Option[];
};

export default function VoteForm({ poll, options }: VoteFormProps) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption || !name.trim()) return;

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
      router.push(`/${poll.url_slug}/results`);
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error('Failed to submit vote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
  );
}
