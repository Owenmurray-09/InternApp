# Clean Job Marketplace App - Development Guide

## Project Overview
This is a clean rebuild of a React Native job marketplace app that connects students with employers. We're recreating the app from MyFirstApp with excellent code quality, proper architecture, and maintainable patterns.

## 🎯 Development Goals
- **Clean Architecture**: Proper separation of concerns, reusable components
- **Type Safety**: Comprehensive TypeScript usage with strict mode
- **Error Handling**: Robust error boundaries and loading states
- **Testing**: Unit tests and integration tests for all features
- **Performance**: Optimized rendering and data fetching
- **Maintainability**: Clear code patterns and documentation

## 🛠️ Tech Stack
- **Frontend**: React Native with Expo Router
- **Backend**: Supabase (PostgreSQL + real-time + auth + storage)
- **Language**: TypeScript (strict mode)
- **Styling**: React Native StyleSheet with theme system
- **State Management**: React Context + hooks
- **Authentication**: Supabase Auth
- **Real-time**: Supabase real-time subscriptions
- **File Storage**: Supabase Storage

## 📁 Project Structure
```
/
├── app/                 # Expo Router file-based routing
├── components/          # Reusable UI components
├── lib/                # Business logic and utilities
│   ├── hooks/          # Custom React hooks
│   ├── auth/           # Authentication logic
│   ├── database/       # Database utilities and types
│   └── utils/          # Helper functions
├── types/              # TypeScript type definitions
├── assets/             # Images, fonts, etc.
└── config/             # App configuration
```

## 🔧 Development Commands

### Essential Commands
```bash
# Start development server
npm run web          # Run on web (localhost:8082)
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator

# Development tools
npm run typecheck    # Run TypeScript checks
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run build        # Build for production
```

### Database Commands
```bash
# Supabase local development
npx supabase start   # Start local Supabase
npx supabase stop    # Stop local Supabase
npx supabase reset   # Reset local database
npx supabase db push # Push schema changes
```

## 🏗️ Development Workflow with Claude Code

### Phase-Based Development
1. **Infrastructure First**: Auth, routing, database setup
2. **Core Features**: User roles, job management, applications
3. **Advanced Features**: Real-time messaging, notifications
4. **Polish**: Error handling, performance, testing

### Claude Code Best Practices
- **Use TodoWrite tool** for complex multi-step tasks
- **Use Plan Mode** for significant architectural changes
- **Regular testing** after each feature implementation
- **File-by-file analysis** when understanding existing code
- **Iterative development** with frequent user feedback

### Collaboration Patterns
- **Feature branches**: One feature per branch
- **Regular commits**: Small, focused commits with clear messages
- **Testing before merge**: All features tested in dev environment
- **Documentation updates**: Update this file as architecture evolves

## 📋 Original App Analysis (from MyFirstApp)

### Key Features to Recreate
1. **Dual Role System**: Students and employers with different flows
2. **Job Management**: Create, browse, apply, review applications
3. **Real-time Messaging**: Chat between students and employers
4. **Profile Management**: User profiles with role-specific fields
5. **Calendar/Events**: Interview scheduling
6. **Image Upload**: Job photos and profile pictures

### Dependencies from Original
- **Core**: React Native 0.79.5, Expo ~53, TypeScript ~5.8
- **Navigation**: Expo Router ~5.1
- **Backend**: Supabase ^2.57
- **Storage**: AsyncStorage, SecureStore
- **UI**: Custom components with theme system
- **Fonts**: Inter, Outfit, Poppins from Expo Google Fonts

### Architecture Patterns to Improve
- **Better error boundaries** and loading states
- **Strict TypeScript** with proper type definitions
- **Consistent naming conventions** for files and components
- **Proper separation** of business logic from UI components
- **Comprehensive testing** strategy

## 🔐 Security & Best Practices

### Authentication
- Use Supabase Auth with proper session management
- Implement role-based access control (RLS policies)
- Secure token storage with SecureStore
- Proper logout and session cleanup

### Data Handling
- Input validation with Zod schemas
- SQL injection prevention through Supabase client
- File upload restrictions and validation
- Proper error handling without exposing sensitive data

### Code Quality
- ESLint + Prettier for consistent formatting
- Strict TypeScript configuration
- Pre-commit hooks for code quality
- Regular dependency updates

## 🚀 Deployment Strategy

### Environment Configuration
- **Development**: Local Supabase + Expo dev server
- **Staging**: Supabase project + Expo builds
- **Production**: App Store deployment + production Supabase

### Performance Considerations
- Image optimization and caching
- Lazy loading for large lists
- Proper memory management
- Bundle size optimization

## 📚 Learning Resources

### Claude Code Documentation
- Local docs available at ~/.claude-code-docs
- Key commands: Plan Mode, TodoWrite, file analysis
- Best practices for React Native development

### External Resources
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native Best Practices](https://reactnative.dev/docs/performance)

## 🎯 Current Phase: Setup & Infrastructure

### Immediate Next Steps
1. ✅ Install Claude Code docs locally
2. 🚧 Create project structure and configuration
3. ⏳ Set up TypeScript strict mode
4. ⏳ Configure development tools (ESLint, Prettier)
5. ⏳ Analyze MyFirstApp architecture and create migration plan

### Success Metrics
- Clean, typed codebase with zero TypeScript errors
- Comprehensive error handling throughout the app
- Fast development workflow with hot reloading
- Maintainable code that's easy to understand and extend