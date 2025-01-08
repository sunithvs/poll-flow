'use client';

import {use, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import type {Option, Poll} from '@/lib/supabase';
import {supabase} from '@/lib/supabase';
import toast from 'react-hot-toast';
import {motion} from 'framer-motion';
import {Loader2, Share2, Vote} from 'lucide-react';

export default function VotePage({params}: { params: Promise<{ slug: string }> }) {
    const {slug} = use(params);
    const [copied, setCopied] = useState(false);
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
                const {data: pollData, error: pollError} = await supabase
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

                const {data: optionsData, error: optionsError} = await supabase
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
            const {data: sessionData, error: sessionError} = await supabase
                .from('sessions')
                .insert({})
                .select()
                .single();

            if (sessionError) throw sessionError;

            const {error: responseError} = await supabase
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
        return (
            <div
                className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4 flex items-center justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin"/>
                    <span>Loading poll...</span>
                </div>
            </div>
        );
    }

    if (!poll || !poll.is_active) {
        return (
            <div
                className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4 flex items-center justify-center">
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4">
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="max-w-2xl mx-auto"
            >
                <div className="bg-card rounded-xl shadow-lg border border-border p-8">
                    <motion.h1
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        className="text-3xl font-bold  mb-6"
                    >
                        {poll.question}
                    </motion.h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <label className="block space-y-2">
                                <span className="text-sm font-medium text-foreground">Your Name</span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    required
                                    maxLength={100}
                                    placeholder="Enter your name"
                                />
                            </label>
                        </div>

                        <div className="space-y-4">
                            <span className="text-sm font-medium text-foreground block mb-4">Choose an Option</span>
                            <motion.div
                                className="space-y-3"
                                variants={{
                                    show: {
                                        transition: {
                                            staggerChildren: 0.1
                                        }
                                    }
                                }}
                                initial="hidden"
                                animate="show"
                            >
                                {options.map((option, index) => (
                                    <motion.label
                                        key={option.id}
                                        variants={{
                                            hidden: {opacity: 0, x: -20},
                                            show: {opacity: 1, x: 0}
                                        }}
                                        className={`flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                            selectedOption === option.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-transparent bg-background hover:border-primary/20'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="option"
                                            value={option.id}
                                            checked={selectedOption === option.id}
                                            onChange={(e) => setSelectedOption(e.target.value)}
                                            className="sr-only"
                                            required
                                        />
                                        <div className="flex items-center gap-3 flex-1">
                                            <div
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                    selectedOption === option.id
                                                        ? 'border-primary'
                                                        : 'border-muted-foreground'
                                                }`}>
                                                {selectedOption === option.id && (
                                                    <motion.div
                                                        initial={{scale: 0}}
                                                        animate={{scale: 1}}
                                                        className="w-3 h-3 rounded-full bg-primary"
                                                    />
                                                )}
                                            </div>
                                            <span className="text-foreground font-medium">{option.option_text}</span>
                                        </div>
                                    </motion.label>
                                ))}
                            </motion.div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin"/>
                                    Submitting Vote...
                                </>
                            ) : (
                                <>
                                    <Vote className="w-4 h-4"/>
                                    Submit Vote
                                </>
                            )}
                        </button>
                    </form>
                    <div className="mt-8 ">
                        <button
                            onClick={handleShare}
                            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                        >
                            {copied ? 'Copied!' : 'Share Poll'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
