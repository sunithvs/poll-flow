'use client';

import { useState } from 'react';
import { nanoid } from 'nanoid';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-card rounded-xl shadow-lg border border-border p-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent mb-2">
            Create a New Poll
          </h1>
          <p className="text-muted-foreground mb-8">
            Create your poll and share it with others to get instant feedback.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Question</span>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                  maxLength={500}
                  placeholder="What would you like to ask?"
                />
              </label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Options</span>
                <span className="text-xs text-muted-foreground">
                  {options.length} option{options.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <motion.div className="space-y-3">
                {options.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-3 items-center"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                      maxLength={200}
                      placeholder="Enter an option"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={addOption}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm font-medium"
              >
                + Add Another Option
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Poll...
                  </>
                ) : (
                  'Create Poll'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
