# Requirements Document

## Introduction

The Smart Hair Flattening feature enhances the AR wig try-on experience by automatically detecting and adjusting for users' existing hair volume. This feature uses AI-driven hair segmentation to create a realistic preview of how wigs would look when worn with a wig cap, without forcing users into an unrealistic bald appearance. The system provides intelligent hair volume detection, soft flattening effects, and user control over the adjustment level, resulting in more accurate and respectful virtual try-on experiences.

## Glossary

- **Hair Segmentation**: The AI-powered process of identifying and isolating hair pixels from the rest of the image using computer vision models
- **Hair Volume Detection**: The algorithmic measurement of visible hair bulk and thickness in the captured image
- **Flattening Effect**: A visual processing technique that reduces the apparent volume of existing hair while preserving natural head shape and scalp visibility
- **Wig Cap Simulation**: The visual effect that mimics how a physical wig cap compresses and contains natural hair underneath a wig
- **Adjustment Mode**: The user-selectable setting that controls the level of hair volume reduction (Normal, Flattened, Bald)
- **Edge Smoothing**: The image processing technique that creates natural transitions between flattened hair regions and the scalp
- **AR Try-On Engine**: The existing augmented reality system that renders virtual wigs on user faces
- **Segmentation Model**: The machine learning model that performs pixel-level classification of hair regions

## Requirements

### Requirement 1

**User Story:** As a user with voluminous hair, I want the AR system to automatically detect my hair volume, so that I can see realistic wig previews without manual adjustments

#### Acceptance Criteria

1. WHEN a user initiates an AR try-on session, THE Segmentation Model SHALL analyze the captured image and identify hair regions within 500 milliseconds
2. WHEN the Segmentation Model detects hair, THE Hair Volume Detection SHALL calculate a volume score ranging from 0 (no visible hair) to 100 (maximum volume)
3. IF the volume score exceeds 40, THEN THE AR Try-On Engine SHALL automatically apply the Flattening Effect
4. WHEN Hair Volume Detection completes, THE AR Try-On Engine SHALL display the volume score to the user as a visual indicator
5. THE Segmentation Model SHALL achieve a minimum accuracy of 85% for hair region identification across diverse hair types and colors

### Requirement 2

**User Story:** As a user, I want my hair to be softly flattened rather than completely removed, so that the preview looks natural and respectful

#### Acceptance Criteria

1. WHEN the Flattening Effect is applied, THE AR Try-On Engine SHALL reduce visible hair volume by 60-80% while preserving scalp and head contours
2. THE Edge Smoothing SHALL create gradual transitions between flattened hair and scalp regions with a minimum blend radius of 5 pixels
3. THE Flattening Effect SHALL preserve skin tone and texture in the scalp region without artificial coloring
4. WHEN hair is flattened, THE AR Try-On Engine SHALL maintain natural shadows and lighting on the head surface
5. THE Flattening Effect SHALL process and apply visual changes within 300 milliseconds of volume detection completion

### Requirement 3

**User Story:** As a user, I want to see a clear message explaining the hair adjustment, so that I understand what the system has done and why

#### Acceptance Criteria

1. WHEN the Flattening Effect is automatically applied, THE AR Try-On Engine SHALL display a message stating "For best results, your hair has been adjusted to fit under the wig. You can change this below."
2. THE message SHALL appear within 200 milliseconds of the Flattening Effect being applied
3. THE message SHALL remain visible for a minimum of 4 seconds or until the user dismisses it
4. THE message SHALL include a visual indicator pointing to the adjustment mode toggle control
5. THE message SHALL use clear, non-technical language appropriate for all user demographics

### Requirement 4

**User Story:** As a user, I want to control the level of hair adjustment with three clear options, so that I can choose the preview style that works best for me

#### Acceptance Criteria

1. THE AR Try-On Engine SHALL provide a toggle control with exactly three Adjustment Modes: "Normal", "Flattened (recommended)", and "Bald (optional, preview only)"
2. WHEN the user selects "Normal" mode, THE AR Try-On Engine SHALL display the original unmodified hair
3. WHEN the user selects "Flattened (recommended)" mode, THE AR Try-On Engine SHALL apply the Wig Cap Simulation with 60-80% volume reduction
4. WHEN the user selects "Bald (optional, preview only)" mode, THE AR Try-On Engine SHALL remove all visible hair while preserving natural scalp appearance
5. WHEN the user changes Adjustment Mode, THE AR Try-On Engine SHALL apply the new setting within 250 milliseconds

### Requirement 5

**User Story:** As a user, I want the wig to align properly with my adjusted hair, so that the virtual try-on looks realistic and believable

#### Acceptance Criteria

1. WHEN the Flattening Effect is active, THE AR Try-On Engine SHALL recalculate wig positioning based on the adjusted head contour
2. THE AR Try-On Engine SHALL blend the wig edges with the flattened hair region using alpha compositing with a minimum blend width of 10 pixels
3. WHEN hair volume changes due to Adjustment Mode selection, THE AR Try-On Engine SHALL update wig positioning within 200 milliseconds
4. THE AR Try-On Engine SHALL ensure no visible gaps between the wig edge and the adjusted hair region
5. THE AR Try-On Engine SHALL maintain proper wig alignment during head rotation up to 45 degrees in any direction

### Requirement 6

**User Story:** As a user, I want realistic lighting and shadows on my adjusted hair and scalp, so that the preview looks natural and not artificially processed

#### Acceptance Criteria

1. WHEN the Flattening Effect is applied, THE AR Try-On Engine SHALL preserve the original lighting direction and intensity from the captured image
2. THE AR Try-On Engine SHALL apply realistic shadows where the wig would naturally cast shadows on the flattened hair or scalp
3. THE AR Try-On Engine SHALL match the ambient lighting color temperature between the wig and the adjusted hair regions
4. WHEN lighting conditions change during the AR session, THE AR Try-On Engine SHALL update shadow rendering within 100 milliseconds
5. THE AR Try-On Engine SHALL ensure shadow opacity ranges from 20% to 60% based on ambient lighting intensity

### Requirement 7

**User Story:** As a user with diverse hair characteristics, I want the hair segmentation to work accurately regardless of my hair color, texture, or style, so that all users have an equal experience

#### Acceptance Criteria

1. THE Segmentation Model SHALL accurately detect hair across a minimum of 10 distinct hair colors (black, brown, blonde, red, gray, white, blue, green, pink, purple)
2. THE Segmentation Model SHALL accurately detect hair across a minimum of 5 hair textures (straight, wavy, curly, coily, kinky)
3. THE Segmentation Model SHALL accurately detect hair in various styles including loose, tied back, braided, and partially covered
4. THE Segmentation Model SHALL maintain a minimum 80% accuracy rate for hair detection on diverse skin tones (Fitzpatrick scale types I-VI)
5. IF the Segmentation Model confidence score falls below 70%, THEN THE AR Try-On Engine SHALL display a message suggesting better lighting or camera positioning

### Requirement 8

**User Story:** As a user, I want the hair adjustment to work in real-time as I move, so that the AR experience remains smooth and responsive

#### Acceptance Criteria

1. WHEN the user moves their head during an AR session, THE Segmentation Model SHALL update hair region detection at a minimum rate of 15 frames per second
2. THE Flattening Effect SHALL maintain consistent visual quality during head movement without flickering or artifacts
3. WHEN the user's hair moves or shifts position, THE AR Try-On Engine SHALL update the flattened region within 100 milliseconds
4. THE AR Try-On Engine SHALL maintain a minimum overall frame rate of 24 FPS while Hair Segmentation and Flattening Effect are active
5. THE AR Try-On Engine SHALL prioritize wig rendering performance over hair segmentation updates if system resources are constrained

### Requirement 9

**User Story:** As a user, I want to see before-and-after comparisons of the hair adjustment, so that I can understand the difference and make informed choices

#### Acceptance Criteria

1. THE AR Try-On Engine SHALL provide a "Compare" button that toggles between the current Adjustment Mode and the original unmodified view
2. WHEN the user activates comparison mode, THE AR Try-On Engine SHALL display a split-screen view showing before and after side-by-side
3. THE comparison view SHALL update in real-time as the user changes Adjustment Modes
4. THE AR Try-On Engine SHALL allow the user to capture screenshots in comparison mode showing both views
5. THE comparison view SHALL include labels clearly identifying "Original" and the selected Adjustment Mode name

### Requirement 10

**User Story:** As a user, I want the system to handle edge cases gracefully, so that I have a reliable experience even with challenging conditions

#### Acceptance Criteria

1. IF the Segmentation Model detects no hair (bald user), THEN THE AR Try-On Engine SHALL skip the Flattening Effect and proceed with standard wig rendering
2. IF the user is wearing a hat or head covering, THEN THE Segmentation Model SHALL detect the covering and THE AR Try-On Engine SHALL display a message suggesting removal for best results
3. IF the captured image quality is too low for accurate segmentation, THEN THE AR Try-On Engine SHALL display a message requesting better lighting or camera focus
4. WHEN multiple faces are detected in the frame, THE AR Try-On Engine SHALL apply hair adjustment only to the primary face (largest or most centered)
5. IF the Segmentation Model fails to complete within 2 seconds, THEN THE AR Try-On Engine SHALL proceed with standard wig rendering without hair adjustment and log the error
