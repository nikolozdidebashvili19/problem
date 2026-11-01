import { KA_REPORT_MESSAGES } from '@/shared/const/messages-ka-reports.const';

// Georgian UI strings — the default language. EN_MESSAGES must have exactly the same shape.
export const KA_MESSAGES = {
  ...KA_REPORT_MESSAGES,
  common: {
    appDescription:
      'დააფიქსირეთ ადგილობრივი პრობლემები მთელ საქართველოში — დაზიანებული გზები, გაფუჭებული განათება, ' +
      'გადავსებული ნაგვის ურნები — და ადევნეთ თვალი მათ მოგვარებას.',
    emergencyNotice: 'Problem.ge არ არის გადაუდებელი დახმარების სამსახური. თუ ვინმე საფრთხეშია, დარეკეთ 112-ზე.',
    freeNotice:
      'Problem.ge უფასოა ყველა მოქალაქისთვის — პრობლემის დაფიქსირება, ხმის მიცემა და დათვალიერება არასდროს იქნება ფასიანი.',
    signIn: 'შესვლა',
    signOut: 'გასვლა',
    signedInAs: 'შესული ხართ როგორც {name}',
    dashboard: 'მართვის პანელი',
    openNavigation: 'ნავიგაციის გახსნა',
    closeNavigation: 'ნავიგაციის დახურვა',
    navigation: 'ნავიგაცია',
    toggleTheme: 'თემის შეცვლა',
  },
  language: {
    // Shown while Georgian is active: offers the other language, written in that language
    short: 'EN',
    switchLabel: 'Switch to English',
    switchLang: 'en',
  },
  search: {
    placeholder: 'მოძებნეთ პრობლემა, ქუჩა ან უბანი…',
    label: 'პრობლემების ძებნა',
  },
  feed: {
    tabs: {
      popular: 'პოპულარული',
      new: 'ახალი',
      fixed: 'მოგვარებული',
    },
    descriptions: {
      popular: 'პრობლემები, რომლებსაც საზოგადოება ახლა ყველაზე მეტად უჭერს მხარს.',
      new: 'მოქალაქეების მიერ ბოლოს დაფიქსირებული პრობლემები.',
      fixed: 'მოგვარებული პრობლემები, დადასტურებული მტკიცებულებებით.',
    },
    sortLabel: 'პრობლემების დალაგება',
    browseLabel: 'პრობლემების დათვალიერება',
    sections: {
      feeds: 'ლენტი',
      tbilisi: 'თბილისი',
      categories: 'კატეგორიები',
    },
    activeFilters: 'აქტიური ფილტრები',
    removeFilter: 'ფილტრის მოხსნა',
    loadMore: 'მეტის ჩატვირთვა',
    loading: 'იტვირთება…',
    loadMoreError: 'მეტი პრობლემის ჩატვირთვა ვერ მოხერხდა. შეამოწმეთ ინტერნეტ-კავშირი და სცადეთ ხელახლა.',
    loadingReports: 'პრობლემები იტვირთება',
    empty: {
      title: 'აქ ჯერ პრობლემა არ დაფიქსირებულა',
      description: 'შენიშნეთ გაფუჭებული სანათი ან ორმო? იყავით პირველი, ვინც მას თქვენს უბანში დააფიქსირებს.',
      filteredTitle: 'ამ ფილტრებით პრობლემები ვერ მოიძებნა',
      filteredDescription: 'სცადეთ სხვა უბანი ან კატეგორია, ან მოხსენით ფილტრები ყველა პრობლემის სანახავად.',
      clear: 'ფილტრების გასუფთავება',
    },
    error: {
      title: 'პრობლემების ჩატვირთვა ვერ მოხერხდა',
      description: 'ჩვენს მხარეს რაღაც შეფერხდა ან კავშირი გაწყდა. გთხოვთ, ცოტა ხანში სცადოთ ხელახლა.',
      retry: 'ხელახლა ცდა',
    },
  },
  report: {
    by: 'ავტორი: {name}',
    photos: '{count} ფოტო',
    fixedOn: 'მოგვარდა {date}',
    upvote: 'მხარდაჭერა: „{title}“',
    removeUpvote: 'მხარდაჭერის გაუქმება: „{title}“',
    votingUnavailable: 'ამ პრობლემაზე ხმის მიცემა შეუძლებელია',
    deletedUser: 'წაშლილი მომხმარებელი',
  },
  about: {
    title: '{app}-ის შესახებ',
    description:
      'უფასო სამოქალაქო პლატფორმა, სადაც მოქალაქეები მთელი საქართველოდან აფიქსირებენ ადგილობრივ პრობლემებს და თვალს ადევნებენ მათ მოგვარებას.',
    steps: {
      report: {
        title: 'დააფიქსირეთ',
        description: 'დაამატეთ ფოტო, მონიშნეთ ადგილი რუკაზე და აირჩიეთ თქვენი უბანი.',
      },
      upvote: {
        title: 'მხარი დაუჭირეთ',
        description: 'ყველაზე მნიშვნელოვანი პრობლემები ლენტის სათავეში აიყვანეთ.',
      },
      track: {
        title: 'თვალი ადევნეთ',
        description: 'ადევნეთ თვალი თითოეულ პრობლემას ოფიციალური პასუხიდან დადასტურებულ მოგვარებამდე.',
      },
    },
  },
  auth: {
    signInTitle: 'შესვლა',
    signInDescription: 'შეიყვანეთ თქვენი მონაცემები ანგარიშზე შესასვლელად',
    email: 'ელ-ფოსტა',
    password: 'პაროლი',
    signingIn: 'შესვლა მიმდინარეობს…',
    or: 'ან',
    continueWithGoogle: 'Google-ით გაგრძელება',
    noAccount: 'არ გაქვთ ანგარიში?',
    signUp: 'რეგისტრაცია',
    createAccountTitle: 'ანგარიშის შექმნა',
    createAccountDescription: 'შეიყვანეთ თქვენი მონაცემები დასაწყებად',
    fullName: 'სახელი და გვარი',
    fullNamePlaceholder: 'გიორგი ბერიძე',
    creatingAccount: 'ანგარიში იქმნება…',
    createAccount: 'ანგარიშის შექმნა',
    haveAccount: 'უკვე გაქვთ ანგარიში?',
    errors: {
      INVALID_CREDENTIALS: 'ელ-ფოსტა ან პაროლი არასწორია',
      LOGIN_FAILED: 'შესვლა ვერ მოხერხდა. სცადეთ ხელახლა.',
      REGISTRATION_FAILED: 'რეგისტრაცია ვერ მოხერხდა. სცადეთ ხელახლა.',
      EMAIL_TAKEN: 'ეს ელ-ფოსტა უკვე დარეგისტრირებულია',
    },
  },
};

export type Messages = typeof KA_MESSAGES;
