# Task 6: Add image generation capability with mode toggle

**Status:** pending  
**Priority:** medium  
**Dependencies:** 4, 5

## Description
Implement OpenAI image generation using gpt-image-1 model with a UI toggle to switch between text and image modes.

## Details
- Create toggle component to switch between text and image modes
- Implement OpenAI image generation API integration using gpt-image-1
- Add Edge Function for image generation requests
- Display generated images in the message list
- Store image URLs in database along with messages
- Update UI to show different input placeholder based on mode
- Add loading state for image generation (usually slower than text)

## Test Strategy
Toggle to image mode, submit an image prompt, verify image is generated and displayed, confirm image URL is saved to database.

## Subtasks
No subtasks defined yet.

