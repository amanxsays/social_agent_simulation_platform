'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Agent, Run } from '@/types';

interface RunSummaryProps {
  run: Run;
  agents: Agent[];
  completedTurns: number;
}

export default function RunSummary({ run, agents, completedTurns }: RunSummaryProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const resetTimerRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const copyRunId = useCallback(async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(run.runId);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = run.runId;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('Fallback copy command failed');
        }
      }
      setCopyState('copied');
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = window.setTimeout(() => {
        setCopyState('idle');
      }, 1500);

    } catch (err) {
      console.error('Failed to copy Run ID:', err);
      setCopyState('error');
      
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
      
      resetTimerRef.current = window.setTimeout(() => {
        setCopyState('idle');
      }, 1500);
    }
  }, [run.runId]);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-beige-900">Run Summary</h2>
      <div className="bg-white border border-beige-300 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-beige-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-beige-900">
                Metric
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-beige-900">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-200">
            <tr>
              <td className="px-4 py-3 text-sm text-beige-800">Run ID</td>
              <td className="px-4 py-3 text-sm text-beige-900 font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-mono">{run.runId}</span>
                  <button
                    type="button"
                    onClick={copyRunId}
                    className="text-accent hover:text-accent-hover text-sm font-medium transition-colors"
                  >
                    {copyState === 'idle' && 'Copy'}
                    {copyState === 'copied' && 'Copied!'}
                    {copyState === 'error' && 'Failed'}
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-beige-800">Completed Turns</td>
              <td className="px-4 py-3 text-sm text-beige-900">
                {completedTurns} / {run.totalTurns}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-beige-800">Total Agents</td>
              <td className="px-4 py-3 text-sm text-beige-900">
                {run.totalAgents}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-beige-800">Status</td>
              <td className="px-4 py-3 text-sm text-beige-900 capitalize">
                {run.status}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-beige-800">Created At</td>
              <td className="px-4 py-3 text-sm text-beige-900">
                {new Date(run.createdAt).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="text-lg font-medium text-beige-900 mb-3">Agents</h3>
        <div className="space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.handle}
              className="bg-white border border-beige-300 rounded-lg p-4"
            >
              <div className="font-medium text-beige-900">{agent.name}</div>
              <div className="text-sm text-beige-600">{agent.handle}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
