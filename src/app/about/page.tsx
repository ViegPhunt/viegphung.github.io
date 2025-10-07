'use client';

import { useState } from 'react';
import { AnimatedBox } from '@/components/ChangePage';
import styles from "@/styles/pages/about.module.css";

const content = {
    english: {
        paragraphs: [
            "Hi, I'm **Viet**, but you can also call me **Pham**. I'm currently a student majoring in **Information Security** at the Posts and Telecommunications Institute of Technology (**PTIT**).",
            "I have a great passion for **technology** and a deep interest in the field of **information security**, which led me to participate in **CTF competitions**. This website was created out of that passion, I wanted it to be a dedicated space for showcasing my **personal projects** and, at the same time, a repository for my **CTF write-ups**.",
            "Beyond studying and taking part in CTF challenges, I also enjoy personalizing my working environment. From customizing my Linux desktop setup to tweaking Windows, I like turning my computer into a space that feels both aesthetically pleasing and comfortable for learning and working."
        ]
    },
    vietnamese: {
        paragraphs: [
            "Xin chào, mình là **Việt**, nhưng bạn cũng có thể gọi mình là **Phàm**. Hiện tại mình đang là sinh viên ngành **An toàn thông tin** tại Học viện Công nghệ Bưu chính Viễn thông (**PTIT**).",
            "Mình là một người đặc biệt yêu thích **công nghệ** và quan tâm nhiều đến lĩnh vực **an toàn thông tin**, điều này đã dẫn dắt mình đến với các **cuộc thi CTF**. Trang web này ra đời cũng chính từ sở thích đó, mình mong muốn nơi này như một không gian để chia sẻ những **project cá nhân** đồng thời để lưu lại những bài **write-up CTF** của mình.",
            "Ngoài việc học và tham gia các giải CTF, mình còn có sở thích cá nhân hoá môi trường làm việc của mình, từ việc tuỳ chỉnh giao diện desktop trên Linux cho đến Windows, tất cả đều nhằm biến chiếc máy tính thành một không gian đẹp mắt và thoải mái hơn trong quá trình học tập và làm việc."
        ]
    }
};

export default function About() {
    const [language, setLanguage] = useState<'vietnamese' | 'english'>('english');
    const currentContent = content[language];

    const toggleLanguage = () => {
        setLanguage(language === 'english' ? 'vietnamese' : 'english');
    };

    // Function to parse highlight markup (**text**)
    const parseHighlight = (text: string) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const highlightedText = part.slice(2, -2);
                return (
                    <span key={index} className={styles.highlight}>
                        {highlightedText}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <AnimatedBox>
            <div className={`container ${styles.aboutContainer}`}>
                <div className={styles.pageHeading}>
                    <h1 className={styles.pageHeadingContent}>
                        About Me
                    </h1>
                    <div className={styles.languageToggle}>
                        <span className={`${styles.languageOption} ${language === 'vietnamese' ? styles.inactive : styles.active}`}>
                            EN
                        </span>
                        <button className={`${styles.toggleButton} ${language === 'vietnamese' ? styles.active : ''}`} onClick={toggleLanguage}>
                            <span className={styles.toggleSlider}></span>
                        </button>
                        <span className={`${styles.languageOption} ${language === 'english' ? styles.inactive : styles.active}`}>
                            VN
                        </span>
                    </div>
                </div>
                
                <div className={styles.aboutContent}>
                    <div className={styles.textContent}>
                        {currentContent.paragraphs.map((paragraph, index) => (
                            <p key={index} className={styles.aboutParagraph}>
                                {parseHighlight(paragraph)}
                            </p>
                        ))}
                    </div>
                </div>

                <div className="divider"></div>

                <AnimatedBox delay={150}>
                    <div className={styles.aboutContact}>
                        <h1 className={styles.pageHeadingContent}>
                            Contact
                        </h1>
                        <div className={styles.contactList}>
                            <div className={styles.contactItem}>
                                <p>Email:</p>
                                <div className={styles.contactLink}>
                                    <a href="mailto:phungquocvietattt@gmail.com">phungquocvietattt@gmail.com</a>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <p>Github:</p>
                                <div className={styles.contactLink}>
                                    <a href="https://github.com/ViegPhunt">github.com/ViegPhunt</a>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <p>Telegram:</p>
                                <div className={styles.contactLink}>
                                    <a href="https://t.me/viegphunt">t.me/viegphunt</a>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <p>Facebook:</p>
                                <div className={styles.contactLink}>
                                    <a href="https://www.facebook.com/phung.viet.68/">facebook.com/phung.viet.68</a>
                                </div>
                            </div>
                        </div>
                    </div>                   
                </AnimatedBox>
            </div>
        </AnimatedBox>
    );
}