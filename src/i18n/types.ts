// Định nghĩa các ngôn ngữ được ứng dụng hỗ trợ
export type SupportedLanguage = "vi" | "en";

// Interface chuẩn cho toàn bộ từ điển ngôn ngữ của ứng dụng SnapStep
export interface TranslationSchema {
  tabs: {
    explore: string;
    map: string;
    snap: string;
    friends: string;
    profile: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    phonePlaceholder: string;
    emailPlaceholder: string;
    useEmail: string;
    usePhone: string;
    continue: string;
    or: string;
    googleSignIn: string;
    noAccount: string;
    signUp: string;
    welcomeBack: string;
    enterPasswordFor: string;
    passwordPlaceholder: string;
    forgotPassword: string;
    signingIn: string;
    logIn: string;
    joinTitle: string;
    joinSubtitle: string;
    confirmPasswordPlaceholder: string;
    creatingAccount: string;
    createAccount: string;
    authAlertTitle: string;
    authMessageExistEmail: string;
    loginAlertTitle: string;
    enterPhoneAlert: string;
    enterEmailAlert: string;
    validEmailAlert: string;
    googleSimulatedAlert: string;
    enterPassAlert: string;
    resetPassTitle: string;
    resetPassSimulatedAlert: string;
    fillAllFieldsAlert: string;
    passMinLengthAlert: string;
    passMismatchAlert: string;
    emailVerifiedTitle: string;
    incorrectEmailOrPassword: string;
    verifyEmailTitle: string;
    verifyEmailSubtitle: string;
    verifyEmailInstruction: string;
    verifiedDoneBtn: string;
    resetPasswordTitle: string;
    resetPasswordSubtitle: string;
    resetPasswordInstruction: string;
    backToLoginBtn: string;
    resendEmail: string;
    logoutOtherAccount: string;
    resendLinkSuccess: string;
    resendLinkError: string;
  };
  explore: {
    searchPlaceholder: string;
    allFilter: string;
    meFilter: string;
    emptyTitle: string;
    emptySubtitle: string;
    findBuddiesBtn: string;
  };
  map: {
    locDeniedTitle: string;
    locDeniedMsg: string;
    locNotFoundTitle: string;
    locNotFoundMsg: string;
  };
  home: {
    settingsTitle: string;
    settingsMsg: string;
    logoutBtn: string;
    closeBtn: string;
    groupSwitchedTitle: string;
    ghostModeTitle: string;
    ghostModeOn: string;
    ghostModeOff: string;
    selectTripAlert: string;
  };
  friends: {
    headerTitle: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptySubtitle: string;
    friendRequestsTitle: string;
  };
  notifications: {
    headerTitle: string;
    emptyText: string;
  };
  conquest: {
    headerTitle: string;
    provincesVisited: string;
    travelRank: string;
    bronzeExplorer: string;
    totalPhotos: string;
    longestStreak: string;
    daysStreak: string;
    leaderboardTitle: string;
    pointsUnit: string;
  };
  milestones: {
    title: string;
    viewAll: string;
    haGiang: string;
    cityHopper: string;
    nightOwl: string;
    streetFoodie: string;
  };
  profile: {
    footprints: string;
    snaps: string;
    buddies: string;
    editProfile: string;
    changePassword: string;
    notifications: string;
    helpAndSupport: string;
    language: string;
    languageName: string;
    logOut: string;
    mySnaps: string;
    savedRoutes: string;
    logoutConfirmTitle: string;
    logoutConfirmMsg: string;
  };
  post: {
    postPreview: string;
    shareToMap: string;
    locationNotSaved: string;
    savePhoto: string;
    postPhoto: string;
    uploading: string;
    shareFeelingsPlaceholder: string;
    deleteConfirmTitle: string;
    deleteConfirmMsg: string;
    deleteSuccessTitle: string;
    deleteSuccessMsg: string;
    optionsTitle: string;
    editPost: string;
    downloadPhoto: string;
    deletePost: string;
    featureDeveloping: string;
    defaultCaption: string;
  };
  common: {
    cancel: string;
    save: string;
    delete: string;
    confirm: string;
    close: string;
    loading: string;
    success: string;
    error: string;
    back: string;
    done: string;
    searchPlaceholder: string;
  };
}
