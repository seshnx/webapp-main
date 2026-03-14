# Social Debug Guide

Enable debug mode:
- window.SocialDebug.setEnabled(true)
- Set DEBUG_SOCIAL=true in .env.local

Debug tools:
- window.SocialDebug.printSummary()
- window.SocialTest.runTestSuite(userId)
- window.SocialTest.createTestPost({ authorId: userId })

See src/utils/socialDebug.ts for full API
