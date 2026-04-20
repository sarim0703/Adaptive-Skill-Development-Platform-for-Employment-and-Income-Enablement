import { describe, it, expect } from 'vitest';
import { registerUser } from '@/app/actions';

describe('Authentication Actions', () => {
  it('should throw an error when missing required fields during registration', async () => {
    const formData = new FormData();
    // Missing email, password, name
    
    await expect(registerUser(formData)).rejects.toThrow('Missing fields');
  });

  it('should throw an error if only email is provided', async () => {
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    // Missing password, name
    
    await expect(registerUser(formData)).rejects.toThrow('Missing fields');
  });
});
