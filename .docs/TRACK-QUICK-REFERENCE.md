# Track Quick Reference Card

**Print this or keep it open while working on your track.**

---

## Your Track Information

**Track Number:** ___  
**Track Name:** _______________________  
**Your Agent Name:** _______________________  
**Dependencies:** _______________________  
**Estimated Duration:** ___ hours  

---

## ✅ Before You Start

- [ ] Clone repository
- [ ] Create feature branch: `git checkout -b feature/track-X-name`
- [ ] Read contract files in `src/shared/contracts/`
- [ ] Check dependencies - can you start now?
- [ ] Set up development environment
- [ ] Post in team chat: "Starting Track X"

---

## 📝 Files You Own (Edit These)

Copy from [Development-Tracks-Summary.md](Development-Tracks-Summary.md) for your track:

1. _______________________
2. _______________________
3. _______________________
4. _______________________
5. _______________________

**Rule:** Only edit files listed above!

---

## 📚 Files You Consume (Read-Only)

Import from these contracts:

```typescript
import { } from '@contracts/ipc';
import { } from '@contracts/stores';
import { } from '@contracts/components';
import { } from '@contracts/services';
import { } from '@types';
```

**Rule:** Never modify contract files!

---

## 🚫 Files You MUST NOT Touch

- Any file owned by another track
- Any file in `src/shared/contracts/` (requires PR)
- Any file in another module's directory

**Rule:** If it's not on your "Files You Own" list, don't touch it!

---

## ⚡ Quick Commands

### Start Development Server
```bash
npm run dev
```

### Type Check
```bash
npx tsc --noEmit
```

### Lint
```bash
npm run lint
```

### Run Tests
```bash
npm test
```

### Build
```bash
npm run build
```

---

## 📋 Daily Checklist

### Morning
- [ ] Pull latest contracts: `git pull origin main`
- [ ] Check team chat for blockers
- [ ] Review your file list
- [ ] Post standup update

### During Development
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] No linter errors: `npm run lint`
- [ ] Code follows contracts
- [ ] Add JSDoc comments

### Evening
- [ ] Commit progress: `git commit -am "progress: track X update"`
- [ ] Push to your branch: `git push origin feature/track-X-name`
- [ ] Post progress update in team chat
- [ ] Update track status board

---

## 📊 Standup Template

**Copy/paste this in team chat:**

```
Agent: [Your Name]
Track: [Number] [Name]
Status: [Not Started | In Progress | Testing | Complete]
Progress: [X]%
Files Done: [X/Y]
Blockers: [None | Description]
Next: [What I'm working on next]
ETA: [When I'll finish]
```

---

## 🧪 Testing Checklist

Before marking complete:

- [ ] Unit tests written
- [ ] Unit tests passing
- [ ] Manual testing complete
- [ ] TypeScript compiles with no errors
- [ ] No linter warnings
- [ ] Implements contract interfaces correctly
- [ ] JSDoc comments added
- [ ] No console.log() left in code
- [ ] No commented-out code

---

## 🔗 Integration Checklist

When ready to integrate:

- [ ] All files complete
- [ ] Tests passing
- [ ] Dependencies complete (if any)
- [ ] PR created with clear description
- [ ] PR reviewed by architect
- [ ] Merged to develop branch
- [ ] Integration tests passing
- [ ] Posted "Track X complete" in team chat

---

## 🆘 When You're Stuck

### Problem: Don't understand contract
**Solution:** Ask Winston (Architect) in `#architecture`

### Problem: Dependency not ready
**Solution:** Use mock contracts, develop against interface

### Problem: Found bug in another track
**Solution:** Don't fix it! File issue and notify that agent

### Problem: Need to change contract
**Solution:** Submit PR to architect with justification

### Problem: Merge conflict
**Solution:** Contact DevOps in `#devops`

### Problem: Integration failing
**Solution:** Post in `#integration` with error details

---

## ✅ Definition of Done

Your track is complete when ALL boxes checked:

- [ ] All files implemented
- [ ] Implements contracts correctly
- [ ] TypeScript: zero errors
- [ ] ESLint: zero warnings
- [ ] Unit tests: all passing
- [ ] Manual testing: complete
- [ ] Documentation: added
- [ ] PR: submitted & approved
- [ ] Code review: passed
- [ ] Integration: successful
- [ ] Merged: to develop

---

## 📞 Emergency Contacts

| Issue | Contact | Channel |
|-------|---------|---------|
| Contract question | Winston (Architect) | #architecture |
| Integration issue | Integration Team | #integration |
| Merge conflict | DevOps | #devops |
| Blocker | Team Lead | #team-lead |

---

## 💡 Pro Tips

1. **Start with interfaces** - Define your public API first
2. **Test early** - Don't wait until the end
3. **Commit often** - Small commits are easier to review
4. **Ask questions** - Better to ask than assume
5. **Check contracts daily** - They might get updated
6. **Use mocks** - Don't wait for dependencies
7. **Keep it simple** - YAGNI (You Ain't Gonna Need It)
8. **Document as you go** - Future you will thank you

---

## 🎯 Success Mantras

- "I only edit files I own"
- "Contracts are read-only"
- "When in doubt, ask"
- "Type safety is my friend"
- "Small commits, frequent pushes"
- "Tests first, code second"

---

**Print this card and keep it visible while working!**

---

**Version:** 1.0  
**Last Updated:** October 27, 2025

