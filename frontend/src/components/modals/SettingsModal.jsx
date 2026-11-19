import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Key,
  ExternalLink,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
  Clock
} from 'lucide-react';
import { getAIProviders, testAIProvider } from '../../services/api';

export default function SettingsModal({
  isOpen,
  onClose,
  systemHealth,
  language = 'en'
}) {
  const isTamil = language === 'ta';

  const [providerData, setProviderData] = useState(null);
  const [testingId, setTestingId] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [selectedModels, setSelectedModels] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadProviders();
    }
  }, [isOpen]);

  const loadProviders = async () => {
    try {
      const data = await getAIProviders();
      setProviderData(data);
      if (data && data.providers) {
        const initialModels = {};
        data.providers.forEach((p) => {
          initialModels[p.id] = p.default_model;
        });
        setSelectedModels(initialModels);
      }
    } catch (err) {
      console.error('Failed to load AI providers:', err);
    }
  };

  const handleTestConnection = async (providerId) => {
    setTestingId(providerId);
    try {
      const model = selectedModels[providerId] || null;
      const res = await testAIProvider(providerId, model);
      setTestResults((prev) => ({
        ...prev,
        [providerId]: res
      }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [providerId]: {
          success: False,
          message: err.message || 'Connection test failed',
          latency_ms: 0
        }
      }));
    } finally {
      setTestingId(null);
    }
  };

  if (!isOpen) return null;

  const providers = providerData ? providerData.providers : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-studio-border bg-studio-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-studio-border pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-studio-purple/20 text-studio-purple-light">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isTamil ? 'AI வழங்குநர்கள் & இணைப்புகள்' : 'AI Providers & Free-First Engine'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isTamil
                  ? 'கட்டண அட்டைகள் இன்றி செயல்படும் இலவச கிளவுட் மற்றும் உள்ளூர் AI மாதிரிகள்'
                  : 'Diagnostic connection manager and model configurations for free AI tiers'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-studio-hover hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free-First Architecture Banner */}
        <div className="my-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 shrink-0">
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-300 leading-relaxed">
              <strong>Free-First Rule:</strong> Anime Studio AI prioritizes free tier models. Primary provider is <strong>Google Gemini</strong> with automatic failover to <strong>OpenRouter Free Models</strong> and our built-in <strong>Offline Engine</strong>. API keys are kept strictly in backend <code className="bg-black/50 text-white px-1.5 py-0.5 rounded">.env</code>.
            </p>
          </div>
        </div>

        {/* Providers List */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
          {providers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading AI provider status...</div>
          ) : (
            providers.map((p) => {
              const test = testResults[p.id];
              const isTesting = testingId === p.id;
              const selectedModel = selectedModels[p.id] || p.default_model;

              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-studio-border bg-studio-elevated/70 p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{p.name}</span>
                      <span className="rounded-md border border-studio-border bg-studio-card px-2 py-0.5 text-[10px] font-medium text-studio-cyan">
                        {p.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {p.is_configured ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Configured
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Requires Key in .env
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Masked Credentials & Model Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                        Credential (Masked):
                      </span>
                      <div className="rounded-lg border border-studio-border bg-studio-card px-3 py-1.5 text-slate-300 font-mono text-[11px] flex items-center justify-between">
                        <span>{p.masked_key}</span>
                        <Key className="h-3 w-3 text-slate-500" />
                      </div>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                        Model:
                      </span>
                      <select
                        value={selectedModel}
                        onChange={(e) =>
                          setSelectedModels((prev) => ({
                            ...prev,
                            [p.id]: e.target.value
                          }))
                        }
                        className="w-full rounded-lg border border-studio-border bg-studio-card px-3 py-1.5 text-xs text-white focus:border-studio-purple focus:outline-none"
                      >
                        {p.available_models.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{p.free_tier_limits}</span>
                    {p.documentation_url && p.documentation_url.startsWith('http') && (
                      <a
                        href={p.documentation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-studio-purple-light hover:underline font-medium"
                      >
                        <span>Get Free Key</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  {/* Test Connection Button & Result */}
                  <div className="border-t border-studio-border/60 pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <button
                      disabled={isTesting}
                      onClick={() => handleTestConnection(p.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-studio-purple/40 bg-studio-purple/10 px-3 py-1.5 text-xs font-semibold text-studio-purple-light hover:bg-studio-purple hover:text-white transition-all disabled:opacity-50 self-start"
                    >
                      {isTesting ? (
                        <>
                          <RotateCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Testing API...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5" />
                          <span>Test Connection</span>
                        </>
                      )}
                    </button>

                    {test && (
                      <div
                        className={`flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-md ${
                          test.success
                            ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/20'
                            : 'text-rose-300 bg-rose-500/10 border border-rose-500/20'
                        }`}
                      >
                        {test.success ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Verified in {test.latency_ms}ms</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                            <span className="line-clamp-1">{test.message}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-studio-border pt-3 mt-3 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="rounded-xl bg-studio-purple px-5 py-2 text-xs font-semibold text-white hover:bg-studio-purple-dark transition-colors"
          >
            {isTamil ? 'மூடு' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
