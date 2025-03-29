document.addEventListener('DOMContentLoaded', function () {
    const forgotPasswordForm = document.getElementById('forgotPasswordFormElement');

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const email = document.getElementById('forgotPasswordEmail').value;
            const errorMessage = document.getElementById('forgotPasswordEmailError');
            const passwordDisplay = document.getElementById('passwordDisplay');

            // Reset error and password display
            errorMessage.textContent = '';
            passwordDisplay.textContent = '';

            try {
                const response = await fetch('http://localhost:9999/api/forgot-password/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                let result;
                try {
                    result = await response.json();
                } catch (parseError) {
                    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
                }

                if (!response.ok) {
                    throw new Error(result.message || 'Đã xảy ra lỗi không xác định');
                }

                passwordDisplay.textContent = `Mật khẩu mới của bạn: ${result.password}`;
                passwordDisplay.style.color = 'green';

            } catch (error) {
                errorMessage.textContent = error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
                errorMessage.style.color = 'red';
                console.error('Lỗi:', error);
            }
        });
    } else {
        console.warn('Element with id not found. Forgot password functionality will not work.');
    }
});