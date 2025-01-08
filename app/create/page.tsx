'use client';

import { useState } from 'react';
import { nanoid } from 'nanoid';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CreatePoll() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const urlSlug = nanoid(10);
      
      // Create poll
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({
          question,
          url_slug: urlSlug,
          is_active: true,
        })
        .select()
        .single();

      if (pollError) throw pollError;

      // Create options
      const optionsToInsert = options
        .filter(opt => opt.trim() !== '')
        .map(option_text => ({
          poll_id: poll.id,
          option_text,
        }));

      const { error: optionsError } = await supabase
        .from('options')
        .insert(optionsToInsert);

      if (optionsError) throw optionsError;

      toast.success('Poll created successfully!');
      router.push(`/${urlSlug}`);
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error('Failed to create poll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create a New Poll</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Question
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              maxLength={500}
            />
          </label>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium">Options</label>
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                maxLength={200}
                placeholder={`Option ${index + 1}`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={addOption}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            + Add Option
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Poll'}
          </button>
        </div>
      </form>
    </div>
  );
}
