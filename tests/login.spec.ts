import { test, expect } from '@playwright/test';

test.describe('Login functionality', () => {
  test('should test login flow and redirection', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Verify login page loads
    await expect(page.locator('h2')).toContainText('HRMIS');
    await expect(page.locator('.ant-typography-secondary').first()).toBeVisible();
    
    // Fill in login credentials
    await page.fill('input[placeholder="Username"]', 'admin');
    await page.fill('input[placeholder="Password"]', 'Admin@123');
    
    // Click sign in button
    await page.click('button[type="submit"]');
    
    // Wait for response and check what happens
    await page.waitForTimeout(3000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL after login attempt:', currentUrl);
    
    // Check for any error messages
    const errorMessages = await page.locator('.ant-message-error').count();
    const successMessages = await page.locator('.ant-message-success').count();
    
    console.log('Error messages:', errorMessages);
    console.log('Success messages:', successMessages);
    
    // Check if we're on dashboard or still on login
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Successfully redirected to dashboard');
      await expect(page).toHaveURL(/.*dashboard.*/);
    } else if (currentUrl.includes('/login')) {
      console.log('❌ Still on login page - authentication failed');
      
      // Try to get any error text
      const errorText = await page.locator('.ant-message-error').textContent().catch(() => 'No error message found');
      console.log('Error details:', errorText);
    } else {
      console.log('🔄 Redirected to unexpected page:', currentUrl);
    }
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'login-test-result.png', fullPage: true });
    console.log('Screenshot saved as login-test-result.png');
  });
});