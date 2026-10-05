/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as artifactBackfill from "../artifactBackfill.js";
import type * as artifactContent from "../artifactContent.js";
import type * as artifactData from "../artifactData.js";
import type * as attachmentMarkdown from "../attachmentMarkdown.js";
import type * as autumn from "../autumn.js";
import type * as axiom from "../axiom.js";
import type * as braintrust from "../braintrust.js";
import type * as braintrustContext from "../braintrustContext.js";
import type * as clerk from "../clerk.js";
import type * as compaction from "../compaction.js";
import type * as composerGates from "../composerGates.js";
import type * as composio from "../composio.js";
import type * as crons from "../crons.js";
import type * as customSkills from "../customSkills.js";
import type * as deployment from "../deployment.js";
import type * as documents from "../documents.js";
import type * as email from "../email.js";
import type * as emails_platinumInvite from "../emails/platinumInvite.js";
import type * as features from "../features.js";
import type * as folders from "../folders.js";
import type * as funnel from "../funnel.js";
import type * as historySearch from "../historySearch.js";
import type * as homeSuggestions from "../homeSuggestions.js";
import type * as html from "../html.js";
import type * as http from "../http.js";
import type * as imageWorker from "../imageWorker.js";
import type * as inference from "../inference.js";
import type * as inference_askQuestion from "../inference/askQuestion.js";
import type * as inference_attachments from "../inference/attachments.js";
import type * as inference_bestEffort from "../inference/bestEffort.js";
import type * as inference_billing from "../inference/billing.js";
import type * as inference_bindingRead from "../inference/bindingRead.js";
import type * as inference_chart from "../inference/chart.js";
import type * as inference_chartBinding from "../inference/chartBinding.js";
import type * as inference_crypto from "../inference/crypto.js";
import type * as inference_designTasteSkill from "../inference/designTasteSkill.js";
import type * as inference_documents from "../inference/documents.js";
import type * as inference_finalize from "../inference/finalize.js";
import type * as inference_generateImage from "../inference/generateImage.js";
import type * as inference_historySearch from "../inference/historySearch.js";
import type * as inference_html from "../inference/html.js";
import type * as inference_htmlTheme from "../inference/htmlTheme.js";
import type * as inference_image from "../inference/image.js";
import type * as inference_integrationSuggest from "../inference/integrationSuggest.js";
import type * as inference_math from "../inference/math.js";
import type * as inference_mcp from "../inference/mcp.js";
import type * as inference_mcpDiagnostics from "../inference/mcpDiagnostics.js";
import type * as inference_mcpMetadata from "../inference/mcpMetadata.js";
import type * as inference_mcpOAuth from "../inference/mcpOAuth.js";
import type * as inference_mcpResolve from "../inference/mcpResolve.js";
import type * as inference_memory from "../inference/memory.js";
import type * as inference_mutationQueue from "../inference/mutationQueue.js";
import type * as inference_openMeteo from "../inference/openMeteo.js";
import type * as inference_reactArtifact from "../inference/reactArtifact.js";
import type * as inference_reasoningReplay from "../inference/reasoningReplay.js";
import type * as inference_replyRepair from "../inference/replyRepair.js";
import type * as inference_search from "../inference/search.js";
import type * as inference_skills from "../inference/skills.js";
import type * as inference_stepOutput from "../inference/stepOutput.js";
import type * as inference_stream from "../inference/stream.js";
import type * as inference_textMatch from "../inference/textMatch.js";
import type * as inference_titleRegen from "../inference/titleRegen.js";
import type * as inference_titles from "../inference/titles.js";
import type * as inference_toolPolicy from "../inference/toolPolicy.js";
import type * as inference_turnUsage from "../inference/turnUsage.js";
import type * as inference_urlSafety from "../inference/urlSafety.js";
import type * as inference_weather from "../inference/weather.js";
import type * as inference_webFetch from "../inference/webFetch.js";
import type * as integrationScan from "../integrationScan.js";
import type * as integrationStore from "../integrationStore.js";
import type * as integrations from "../integrations.js";
import type * as kirkify from "../kirkify.js";
import type * as kirkify_aspect from "../kirkify/aspect.js";
import type * as kirkify_limits from "../kirkify/limits.js";
import type * as kirkify_prompt from "../kirkify/prompt.js";
import type * as kirkify_references from "../kirkify/references.js";
import type * as lockedInference from "../lockedInference.js";
import type * as lockedPolicy from "../lockedPolicy.js";
import type * as lockedThreads from "../lockedThreads.js";
import type * as mcpOAuthFlow from "../mcpOAuthFlow.js";
import type * as mcpServers from "../mcpServers.js";
import type * as memory from "../memory.js";
import type * as memoryIndex from "../memoryIndex.js";
import type * as messageQueue from "../messageQueue.js";
import type * as messages from "../messages.js";
import type * as modelFavorites from "../modelFavorites.js";
import type * as models from "../models.js";
import type * as performance from "../performance.js";
import type * as platinum from "../platinum.js";
import type * as posthog from "../posthog.js";
import type * as preferences from "../preferences.js";
import type * as prompts from "../prompts.js";
import type * as serverLoad from "../serverLoad.js";
import type * as shareLinks from "../shareLinks.js";
import type * as site from "../site.js";
import type * as skillStore from "../skillStore.js";
import type * as skills from "../skills.js";
import type * as slotActions from "../slotActions.js";
import type * as slotCodes from "../slotCodes.js";
import type * as slotRewards from "../slotRewards.js";
import type * as slots from "../slots.js";
import type * as slots_billing from "../slots/billing.js";
import type * as slots_catalog from "../slots/catalog.js";
import type * as slots_guest from "../slots/guest.js";
import type * as slots_tables from "../slots/tables.js";
import type * as storeCategories from "../storeCategories.js";
import type * as storeCategorize from "../storeCategorize.js";
import type * as streamFlush from "../streamFlush.js";
import type * as streamWatchdog from "../streamWatchdog.js";
import type * as suggestions_context from "../suggestions/context.js";
import type * as suggestions_fallbacks from "../suggestions/fallbacks.js";
import type * as suggestions_generate from "../suggestions/generate.js";
import type * as suggestions_parse from "../suggestions/parse.js";
import type * as suggestions_prompt from "../suggestions/prompt.js";
import type * as suggestions_random from "../suggestions/random.js";
import type * as suggestions_text from "../suggestions/text.js";
import type * as suggestions_types from "../suggestions/types.js";
import type * as supermemory from "../supermemory.js";
import type * as supermemoryManage from "../supermemoryManage.js";
import type * as supermemorySearch from "../supermemorySearch.js";
import type * as support_account from "../support/account.js";
import type * as support_guard from "../support/guard.js";
import type * as support_integrations from "../support/integrations.js";
import type * as support_labels from "../support/labels.js";
import type * as support_refunds from "../support/refunds.js";
import type * as support_replies from "../support/replies.js";
import type * as support_threadRef from "../support/threadRef.js";
import type * as support_threads from "../support/threads.js";
import type * as support_usage from "../support/usage.js";
import type * as threadCompaction from "../threadCompaction.js";
import type * as threads from "../threads.js";
import type * as transcription from "../transcription.js";
import type * as turns from "../turns.js";
import type * as usageLedger from "../usageLedger.js";
import type * as userContext from "../userContext.js";
import type * as userMemory from "../userMemory.js";
import type * as validators from "../validators.js";
import type * as zeroRetention from "../zeroRetention.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  artifactBackfill: typeof artifactBackfill;
  artifactContent: typeof artifactContent;
  artifactData: typeof artifactData;
  attachmentMarkdown: typeof attachmentMarkdown;
  autumn: typeof autumn;
  axiom: typeof axiom;
  braintrust: typeof braintrust;
  braintrustContext: typeof braintrustContext;
  clerk: typeof clerk;
  compaction: typeof compaction;
  composerGates: typeof composerGates;
  composio: typeof composio;
  crons: typeof crons;
  customSkills: typeof customSkills;
  deployment: typeof deployment;
  documents: typeof documents;
  email: typeof email;
  "emails/platinumInvite": typeof emails_platinumInvite;
  features: typeof features;
  folders: typeof folders;
  funnel: typeof funnel;
  historySearch: typeof historySearch;
  homeSuggestions: typeof homeSuggestions;
  html: typeof html;
  http: typeof http;
  imageWorker: typeof imageWorker;
  inference: typeof inference;
  "inference/askQuestion": typeof inference_askQuestion;
  "inference/attachments": typeof inference_attachments;
  "inference/bestEffort": typeof inference_bestEffort;
  "inference/billing": typeof inference_billing;
  "inference/bindingRead": typeof inference_bindingRead;
  "inference/chart": typeof inference_chart;
  "inference/chartBinding": typeof inference_chartBinding;
  "inference/crypto": typeof inference_crypto;
  "inference/designTasteSkill": typeof inference_designTasteSkill;
  "inference/documents": typeof inference_documents;
  "inference/finalize": typeof inference_finalize;
  "inference/generateImage": typeof inference_generateImage;
  "inference/historySearch": typeof inference_historySearch;
  "inference/html": typeof inference_html;
  "inference/htmlTheme": typeof inference_htmlTheme;
  "inference/image": typeof inference_image;
  "inference/integrationSuggest": typeof inference_integrationSuggest;
  "inference/math": typeof inference_math;
  "inference/mcp": typeof inference_mcp;
  "inference/mcpDiagnostics": typeof inference_mcpDiagnostics;
  "inference/mcpMetadata": typeof inference_mcpMetadata;
  "inference/mcpOAuth": typeof inference_mcpOAuth;
  "inference/mcpResolve": typeof inference_mcpResolve;
  "inference/memory": typeof inference_memory;
  "inference/mutationQueue": typeof inference_mutationQueue;
  "inference/openMeteo": typeof inference_openMeteo;
  "inference/reactArtifact": typeof inference_reactArtifact;
  "inference/reasoningReplay": typeof inference_reasoningReplay;
  "inference/replyRepair": typeof inference_replyRepair;
  "inference/search": typeof inference_search;
  "inference/skills": typeof inference_skills;
  "inference/stepOutput": typeof inference_stepOutput;
  "inference/stream": typeof inference_stream;
  "inference/textMatch": typeof inference_textMatch;
  "inference/titleRegen": typeof inference_titleRegen;
  "inference/titles": typeof inference_titles;
  "inference/toolPolicy": typeof inference_toolPolicy;
  "inference/turnUsage": typeof inference_turnUsage;
  "inference/urlSafety": typeof inference_urlSafety;
  "inference/weather": typeof inference_weather;
  "inference/webFetch": typeof inference_webFetch;
  integrationScan: typeof integrationScan;
  integrationStore: typeof integrationStore;
  integrations: typeof integrations;
  kirkify: typeof kirkify;
  "kirkify/aspect": typeof kirkify_aspect;
  "kirkify/limits": typeof kirkify_limits;
  "kirkify/prompt": typeof kirkify_prompt;
  "kirkify/references": typeof kirkify_references;
  lockedInference: typeof lockedInference;
  lockedPolicy: typeof lockedPolicy;
  lockedThreads: typeof lockedThreads;
  mcpOAuthFlow: typeof mcpOAuthFlow;
  mcpServers: typeof mcpServers;
  memory: typeof memory;
  memoryIndex: typeof memoryIndex;
  messageQueue: typeof messageQueue;
  messages: typeof messages;
  modelFavorites: typeof modelFavorites;
  models: typeof models;
  performance: typeof performance;
  platinum: typeof platinum;
  posthog: typeof posthog;
  preferences: typeof preferences;
  prompts: typeof prompts;
  serverLoad: typeof serverLoad;
  shareLinks: typeof shareLinks;
  site: typeof site;
  skillStore: typeof skillStore;
  skills: typeof skills;
  slotActions: typeof slotActions;
  slotCodes: typeof slotCodes;
  slotRewards: typeof slotRewards;
  slots: typeof slots;
  "slots/billing": typeof slots_billing;
  "slots/catalog": typeof slots_catalog;
  "slots/guest": typeof slots_guest;
  "slots/tables": typeof slots_tables;
  storeCategories: typeof storeCategories;
  storeCategorize: typeof storeCategorize;
  streamFlush: typeof streamFlush;
  streamWatchdog: typeof streamWatchdog;
  "suggestions/context": typeof suggestions_context;
  "suggestions/fallbacks": typeof suggestions_fallbacks;
  "suggestions/generate": typeof suggestions_generate;
  "suggestions/parse": typeof suggestions_parse;
  "suggestions/prompt": typeof suggestions_prompt;
  "suggestions/random": typeof suggestions_random;
  "suggestions/text": typeof suggestions_text;
  "suggestions/types": typeof suggestions_types;
  supermemory: typeof supermemory;
  supermemoryManage: typeof supermemoryManage;
  supermemorySearch: typeof supermemorySearch;
  "support/account": typeof support_account;
  "support/guard": typeof support_guard;
  "support/integrations": typeof support_integrations;
  "support/labels": typeof support_labels;
  "support/refunds": typeof support_refunds;
  "support/replies": typeof support_replies;
  "support/threadRef": typeof support_threadRef;
  "support/threads": typeof support_threads;
  "support/usage": typeof support_usage;
  threadCompaction: typeof threadCompaction;
  threads: typeof threads;
  transcription: typeof transcription;
  turns: typeof turns;
  usageLedger: typeof usageLedger;
  userContext: typeof userContext;
  userMemory: typeof userMemory;
  validators: typeof validators;
  zeroRetention: typeof zeroRetention;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  persistentTextStreaming: import("@convex-dev/persistent-text-streaming/_generated/component.js").ComponentApi<"persistentTextStreaming">;
  autumn: import("@useautumn/convex/_generated/component.js").ComponentApi<"autumn">;
};
