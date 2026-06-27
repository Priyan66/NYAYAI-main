import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PipelineState, DisputeRecord, DocumentSet, AgentStatus } from '@/types';

interface DisputeStore extends PipelineState {
  setDisputeId: (id: string) => void;
  setCurrentStep: (step: PipelineState['currentStep']) => void;
  setAgentStatus: (
    agentId: 1 | 2 | 3 | 4,
    status: AgentStatus['status'],
    logLine?: string
  ) => void;
  setDisputeRecord: (record: DisputeRecord) => void;
  updateDocuments: (docs: Partial<DocumentSet>) => void;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (chunk: string) => void;
  setAdversarialPhase: (phase: PipelineState['adversarialPhase']) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}

const initialAgents: AgentStatus[] = [
  {
    id: 1,
    name: 'Intake Parser',
    description: 'Understanding your dispute',
    status: 'pending',
    logLine: 'Waiting...',
  },
  {
    id: 2,
    name: 'Legal Intelligence',
    description: 'Searching court records',
    status: 'pending',
    logLine: 'Waiting...',
  },
  {
    id: 3,
    name: 'Document Drafter',
    description: 'Drafting legal documents',
    status: 'pending',
    logLine: 'Waiting...',
  },
  {
    id: 4,
    name: 'Adversarial Review',
    description: 'Testing document strength',
    status: 'pending',
    logLine: 'Waiting...',
  },
];

const initialState: PipelineState = {
  disputeId: null,
  currentStep: 'idle',
  agents: initialAgents,
  disputeRecord: null,
  documents: {},
  streamingContent: '',
  adversarialPhase: 'idle',
  error: null,
};

export const useDisputeStore = create<DisputeStore>()(
  persist(
    (set) => ({
      ...initialState,
      setDisputeId: (id) => set({ disputeId: id }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setAgentStatus: (agentId, status, logLine) =>
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId ? { ...a, status, ...(logLine ? { logLine } : {}) } : a
          ),
        })),
      setDisputeRecord: (record) => set({ disputeRecord: record }),
      updateDocuments: (docs) =>
        set((state) => ({ documents: { ...state.documents, ...docs } })),
      setStreamingContent: (content) => set({ streamingContent: content }),
      appendStreamingContent: (chunk) =>
        set((state) => ({ streamingContent: state.streamingContent + chunk })),
      setAdversarialPhase: (phase) => set({ adversarialPhase: phase }),
      setError: (err) => set({ error: err }),
      reset: () => set({ ...initialState, agents: initialAgents.map((a) => ({ ...a })) }),
    }),
    {
      name: 'nyay-dispute-store',
      partialize: (state) => ({
        disputeId: state.disputeId,
        disputeRecord: state.disputeRecord,
        documents: state.documents,
      }),
    }
  )
);
