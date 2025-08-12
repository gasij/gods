document.addEventListener('DOMContentLoaded', function() {
    // ========== Общие анимации и обработчики ==========
    // [Ваш существующий код анимаций и обработчиков...]

    // ========== Улучшенная обработка формы ==========
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('form-message');

    // Функция для показа сообщений
    function showMessage(text, type = 'info') {
        formMessage.textContent = text;
        formMessage.className = `form-message ${type}`; // Добавляем класс для стилизации
        formMessage.style.display = 'block';
        
        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }

    // Валидация телефона (простая проверка)
    function validatePhone(phone) {
        return /^[\d\+][\d\s\-\(\)]{5,15}$/.test(phone);
    }

    // Обработчик для кнопок "Заказать"
    document.querySelectorAll('.product-card .btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            
            document.getElementById('contact').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            document.getElementById('message').value = `Хочу заказать: ${productName} (${productPrice})`;
            document.getElementById('name').focus();
        });
    });

    // Основной обработчик формы
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Получаем и очищаем данные
        const formData = {
            name: contactForm.querySelector('[name="name"]').value.trim(),
            phone: contactForm.querySelector('[name="phone"]').value.trim(),
            message: contactForm.querySelector('[name="message"]').value.trim() || 'Не указано'
        };
        
        // Валидация
        if (!formData.name) {
            showMessage('Пожалуйста, введите ваше имя', 'error');
            return;
        }
        
        if (!formData.phone || !validatePhone(formData.phone)) {
            showMessage('Пожалуйста, введите корректный телефон', 'error');
            return;
        }
        
        // Блокируем кнопку
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправляем...';
        
        try {
            const response = await fetch('http://localhost:5000/api/send-to-telegram', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            // Обрабатываем HTTP-ошибки
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Успешная отправка
            showMessage('✅ Спасибо! Ваша заявка отправлена.', 'success');
            contactForm.reset();
            
        } catch (error) {
            console.error('Ошибка:', error);
            
            // Определяем тип ошибки
            let errorMessage = error.message;
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Проблемы с подключением. Проверьте интернет.';
            }
            
            showMessage(`❌ ${errorMessage}`, 'error');
            
        } finally {
            // Всегда разблокируем кнопку
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Отправить заявку';
        }
    });
});