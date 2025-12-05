@echo off
echo Cleaning up unnecessary documentation files...

REM Remove completion status files
del /Q 2_DAY_COMPLETION_STATUS.md 2>nul
del /Q DAY_2_GUEST_CHECKOUT_COMPLETE.md 2>nul
del /Q DAY_2_SUMMARY.md 2>nul
del /Q DAY_3_REGISTRATION_INCENTIVES_COMPLETE.md 2>nul
del /Q DAY_4_COMPLETE.md 2>nul
del /Q 4_DAY_COMPLETION_PLAN.md 2>nul
del /Q 5_DAY_SPRINT_PLAN.md 2>nul
del /Q PROJECT_COMPLETE.md 2>nul
del /Q PROJECT_READY_FOR_LAUNCH.md 2>nul
del /Q TASK_22_COMPLETION_SUMMARY.md 2>nul
del /Q TASK_27_COMPLETION_SUMMARY.md 2>nul

REM Remove fix/debug documentation
del /Q ADMIN_DELETE_FIX.md 2>nul
del /Q ADMIN_DELETE_ISSUE_SUMMARY.md 2>nul
del /Q ADMIN_LOGIN_FINAL_FIX.md 2>nul
del /Q ADMIN_LOGIN_FIXED.md 2>nul
del /Q ALL_SYSTEMS_WORKING.md 2>nul
del /Q AR_CRITICAL_ISSUES_REPORT.md 2>nul
del /Q AR_FIXED_SUMMARY.md 2>nul
del /Q AR_ISSUES_FIXED.md 2>nul
del /Q AR_QUICK_FIX_CARD.md 2>nul
del /Q AR_SIMPLIFIED.md 2>nul
del /Q AR_SLIDER_FIX_COMPLETE.md 2>nul
del /Q AR_TRYON_FIXES_APPLIED.md 2>nul
del /Q AR_TRYON_ISSUES_FOUND.md 2>nul
del /Q AR_TRYON_QUICK_FIX.md 2>nul
del /Q CART_ADD_TO_CART_FIX.md 2>nul
del /Q CART_AND_AR_FIXED.md 2>nul
del /Q CHECKOUT_BUTTON_DEBUG.md 2>nul
del /Q COMPLETE_DELETE_DEBUG.md 2>nul
del /Q DELETE_AND_LOGIN_FIXES.md 2>nul
del /Q DELETE_CACHE_FIXED.md 2>nul
del /Q EMERGENCY_AR_FIX.md 2>nul
del /Q ENV_VALIDATION_REPORT.md 2>nul
del /Q EVERYTHING_WORKING_NOW.md 2>nul
del /Q FINAL_FIX_DELETE.md 2>nul
del /Q FINAL_PRODUCTION_FIX.md 2>nul
del /Q FINAL_STATUS_WORKING.md 2>nul
del /Q FIX_ADMIN_DELETE_NOW.md 2>nul
del /Q FIX_DELETE_403.md 2>nul
del /Q FIX_FRONTEND_NOW.md 2>nul
del /Q FIX_POSTGRES_NOW.md 2>nul
del /Q FIX_PRODUCTS_NOT_LOADING.md 2>nul
del /Q FIX_PRODUCTS_NOW.md 2>nul
del /Q FIX_UPLOAD_BUTTON.md 2>nul
del /Q FIXES_COMPLETE_SUMMARY.md 2>nul
del /Q GUEST_CART_FIXED.md 2>nul
del /Q GUEST_PAYMENT_FIXED.md 2>nul
del /Q LOGIN_FIXED_AND_SHOW_PASSWORD.md 2>nul
del /Q MEDIAPIPE_FIX.md 2>nul
del /Q MOBILE_CAMERA_FIX.md 2>nul
del /Q PAYMENT_COMPLETION_FIX.md 2>nul
del /Q PRODUCT_DELETE_FIX.md 2>nul
del /Q PRODUCT_FORM_UPDATE_NEEDED.md 2>nul
del /Q PRODUCT_FORM_UPDATED.md 2>nul
del /Q PRODUCTS_DISPLAY_FIXED.md 2>nul
del /Q PRODUCTS_FINAL_FIX.md 2>nul
del /Q PRODUCTS_NOT_LOADING_FIX.md 2>nul
del /Q PRODUCTS_NOT_LOADING_SOLUTION.md 2>nul
del /Q QUICK_FIX_WIG_IMAGES.md 2>nul
del /Q QUICK_START_AFTER_FIX.md 2>nul
del /Q REGISTRATION_FIX.md 2>nul
del /Q SIMPLE2DAR_HAIR_FLATTENING_FIX.md 2>nul

REM Remove duplicate/redundant summaries
del /Q 2D_AR_COMPLETE_SUMMARY.md 2>nul
del /Q ACCESSORIES_REMOVED.md 2>nul
del /Q ADAPTIVE_QUALITY_SYSTEM_COMPLETE.md 2>nul
del /Q ANALYTICS_SUMMARY.md 2>nul
del /Q AR_INTELLIGENT_FITTING_COMPLETE.md 2>nul
del /Q AUTHENTICATION_COMPLETE.md 2>nul
del /Q BRANDING_UPDATE_COMPLETE.md 2>nul
del /Q CREATE_PERFECT_WIG_PRODUCT.md 2>nul
del /Q DATABASE_STATUS.md 2>nul
del /Q DEPLOYMENT_IMPLEMENTATION_SUMMARY.md 2>nul
del /Q E2E_GUEST_PURCHASE_COMPLETE.md 2>nul
del /Q FINAL_LAUNCH_SUMMARY.md 2>nul
del /Q FINAL_SETUP.md 2>nul
del /Q GUEST_CHECKOUT_BACKEND_COMPLETE.md 2>nul
del /Q GUEST_CHECKOUT_COMPLETE.md 2>nul
del /Q GUEST_CHECKOUT_TEST_RESULTS.md 2>nul
del /Q HAIR_FLATTENING_ANALYTICS_COMPLETE.md 2>nul
del /Q HAIR_FLATTENING_PREFERENCES_COMPLETE.md 2>nul
del /Q HOMEPAGE_REBRAND_COMPLETE.md 2>nul
del /Q LAUNCH_READY_FINAL.md 2>nul
del /Q LAUNCH_READY_SUMMARY.md 2>nul
del /Q MEDIAPIPE_INTEGRATION_COMPLETE.md 2>nul
del /Q MOBILE_FIRST_COMPLETE.md 2>nul
del /Q MOBILE_FIRST_SUMMARY.md 2>nul
del /Q NAVIGATION_SUMMARY.md 2>nul
del /Q PERFORMANCE_TASK_COMPLETION.md 2>nul
del /Q REDIS_AND_TESTING_COMPLETE.md 2>nul
del /Q S3_CLOUDFRONT_IMPLEMENTATION_SUMMARY.md 2>nul
del /Q SIMPLE2DAR_HAIR_FLATTENING_COMPLETE.md 2>nul
del /Q SPOOKY_UI_ENHANCEMENTS_COMPLETE.md 2>nul
del /Q THREE_THUMBNAILS_IMPLEMENTATION_COMPLETE.md 2>nul
del /Q VOLUME_SCORE_DISPLAY_COMPLETE.md 2>nul

REM Remove temporary/session files
del /Q COMPLETE_PURCHASE_TEST.md 2>nul
del /Q DEPLOY_NOW.md 2>nul
del /Q DEPLOYMENT_QUICK_FIX.md 2>nul
del /Q MANDATORY_COMPLETION_CHECKLIST.md 2>nul
del /Q MCP_INSTALLATION_COMPLETE.md 2>nul
del /Q MCP_POSTGRES_FIXED.md 2>nul
del /Q MCP_POSTGRES_WORKAROUND.md 2>nul
del /Q MCP_SETUP_GUIDE.md 2>nul
del /Q PROJECT_ANALYSIS_AND_STRATEGY.md 2>nul
del /Q PROJECT_GAPS_ANALYSIS.md 2>nul
del /Q PROJECT_STATUS.md 2>nul
del /Q READY_TO_TEST.md 2>nul
del /Q SESSION_SUMMARY.md 2>nul
del /Q TEST_AR_NOW.md 2>nul
del /Q TEST_AR_TRYON_NOW.md 2>nul
del /Q TONIGHT_ACTION_PLAN.md 2>nul
del /Q WHAT_IS_MISSING.md 2>nul
del /Q WHAT_TO_CHECK_NOW.md 2>nul
del /Q YOUR_NEXT_STEPS.md 2>nul

REM Remove Supabase cleanup doc (already done)
del /Q SUPABASE_CLEANUP_COMPLETE.md 2>nul

echo Cleanup complete!
echo.
echo Kept essential documentation:
echo - README.md (main project readme)
echo - START_HERE.md (getting started guide)
echo - DEPLOYMENT.md (deployment guide)
echo - TESTING_CHECKLIST.md (testing guide)
echo - Feature implementation guides (AR, Analytics, etc.)
echo - Quick reference guides
echo - Architecture documentation
pause
