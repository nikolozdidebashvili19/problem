import { EN_REPORT_MESSAGES } from '@/shared/const/messages-en-reports.const';
import { Messages } from '@/shared/const/messages-ka.const';

// Typed against the Georgian messages so a missing or extra key fails the typecheck
export const EN_MESSAGES: Messages = {
  ...EN_REPORT_MESSAGES,
  common: {
    appDescription:
      'Report local problems across Georgia — damaged roads, broken streetlights, overflowing bins — and track them until they are fixed.',
    emergencyNotice: 'Problem.ge is not an emergency service. If someone is in danger, call 112.',
    freeNotice: 'Problem.ge is free for every citizen — reporting, voting and viewing will never cost money.',
    signIn: 'Sign in',
    signOut: 'Sign out',
    signedInAs: 'Signed in as {name}',
    dashboard: 'Dashboard',
    openNavigation: 'Open navigation',
    closeNavigation: 'Close navigation',
    navigation: 'Navigation',
    toggleTheme: 'Toggle theme',
  },
  language: {
    short: 'ქარ',
    switchLabel: 'ქართულ ენაზე გადართვა',
    switchLang: 'ka',
  },
  search: {
    placeholder: 'Search problems, streets, neighborhoods…',
    label: 'Search reports',
  },
  feed: {
    tabs: {
      popular: 'Popular',
      new: 'Newest',
      fixed: 'Fixed',
    },
    descriptions: {
      popular: 'Problems the community is pushing to the top right now.',
      new: 'The latest problems reported by citizens.',
      fixed: 'Resolved problems, verified with evidence.',
    },
    sortLabel: 'Sort reports',
    browseLabel: 'Browse reports',
    sections: {
      feeds: 'Feeds',
      tbilisi: 'Tbilisi',
      categories: 'Categories',
    },
    activeFilters: 'Active filters',
    removeFilter: 'Remove filter',
    loadMore: 'Load more',
    loading: 'Loading…',
    loadMoreError: 'Could not load more reports. Check your connection and try again.',
    loadingReports: 'Loading reports',
    empty: {
      title: 'No problems reported here yet',
      description: 'Spotted a broken streetlight or a pothole? Be the first to report it for your neighborhood.',
      filteredTitle: 'No reports match these filters',
      filteredDescription: 'Try a different neighborhood or category, or clear the filters to see every report.',
      clear: 'Clear filters',
    },
    error: {
      title: 'Reports could not be loaded',
      description: 'Something went wrong on our side or your connection dropped. Please try again in a moment.',
      retry: 'Try again',
    },
  },
  report: {
    by: 'by <author>{name}</author>',
    photos: '{count} photos',
    fixedOn: 'Fixed {date}',
    upvote: 'Upvote “{title}”',
    removeUpvote: 'Remove upvote from “{title}”',
    votingUnavailable: 'Voting is not available for this report',
    deletedUser: 'Deleted user',
  },
  about: {
    title: 'About {app}',
    description:
      'A free civic platform where citizens across Georgia report local problems and track them until they are fixed.',
    steps: {
      report: {
        title: 'Report',
        description: 'Add a photo, pin the spot on the map and pick your neighborhood.',
      },
      upvote: {
        title: 'Upvote',
        description: 'Push the problems that matter most to the top of the feed.',
      },
      track: {
        title: 'Track',
        description: 'Follow each report from official response to verified fix.',
      },
    },
  },
  auth: {
    signInTitle: 'Sign in',
    signInDescription: 'Enter your credentials to access your account',
    email: 'Email',
    password: 'Password',
    signingIn: 'Signing in…',
    or: 'or',
    continueWithGoogle: 'Continue with Google',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    createAccountTitle: 'Create account',
    createAccountDescription: 'Enter your details to get started',
    fullName: 'Full name',
    fullNamePlaceholder: 'Giorgi Beridze',
    creatingAccount: 'Creating account…',
    createAccount: 'Create account',
    haveAccount: 'Already have an account?',
    errors: {
      INVALID_CREDENTIALS: 'Invalid email or password',
      LOGIN_FAILED: 'Sign in failed. Please try again.',
      REGISTRATION_FAILED: 'Registration failed. Please try again.',
      EMAIL_TAKEN: 'This email is already registered',
    },
  },
};
