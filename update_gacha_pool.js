const fs = require('fs');
const file = '/Users/v.nguyen/dev/vang-vong-su-viet/src/data/gachaPool.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "role: 'Tank' | 'DPS' | 'Support'",
  "role: 'Tank' | 'DPS' | 'Support' | 'Assassin'"
);

content = content.replace(
  "backgroundUrl?: string",
  "backgroundUrl?: string\n  rage?: number\n  maxRage?: number\n  skill?: {\n    name: string\n    damageMultiplier: number\n    rageRecovery?: number\n    rageSteal?: number\n  }"
);

const skillsMap = {
  'Trần Hưng Đạo': "{ name: 'Vạn Kiếp Tông Bí Truyền', damageMultiplier: 2.2, rageRecovery: 10 }",
  'Quang Trung': "{ name: 'Hỏa Tốc Tiến Công', damageMultiplier: 2.5 }",
  'Bà Triệu': "{ name: 'Đạp Luồng Sóng Dữ', damageMultiplier: 1.8, rageSteal: 15 }",
  'Đinh Tiên Hoàng': "{ name: 'Vạn Thắng Cờ Lau', damageMultiplier: 2.0, rageRecovery: 20 }",
  'Trần Quốc Toản': "{ name: 'Phá Cường Địch', damageMultiplier: 2.3 }",
  'Ngô Quyền': "{ name: 'Bạch Đằng Phục Kích', damageMultiplier: 1.8, rageSteal: 10 }",
  'Lê Lợi': "{ name: 'Lam Sơn Kiếm Pháp', damageMultiplier: 2.0, rageRecovery: 20 }",
  'Nguyễn Trãi': "{ name: 'Bình Ngô Sách', damageMultiplier: 1.5, rageSteal: 20 }",
  'Hai Bà Trưng': "{ name: 'Mê Linh Khởi Nghĩa', damageMultiplier: 2.0, rageRecovery: 30 }",
  'Lý Thường Kiệt': "{ name: 'Nam Quốc Sơn Hà', damageMultiplier: 1.6, rageSteal: 15 }",
  'Lê Đại Hành': "{ name: 'Phá Tống Bình Chiêm', damageMultiplier: 1.9, rageRecovery: 15 }",
  'Bố Cái Đại Vương': "{ name: 'Quật Khởi Đường Lâm', damageMultiplier: 1.7, rageSteal: 5 }",
  'Phạm Ngũ Lão': "{ name: 'Múa Giáo Đâm Trâu', damageMultiplier: 2.1 }",
  'Yết Kiêu': "{ name: 'Thần Thủy Đục Thuyền', damageMultiplier: 1.6, rageSteal: 20 }",
  'Dã Tượng': "{ name: 'Tượng Binh Xung Kích', damageMultiplier: 1.7, rageRecovery: 10 }"
};

for (const [name, skillStr] of Object.entries(skillsMap)) {
  const regex = new RegExp(`(name:\\s*'${name}',[\\s\\S]*?)(  },|  })`, 'g');
  content = content.replace(regex, (match, p1, p2) => {
    if (p1.includes('skill:')) return match;
    return `${p1}    rage: 0,\n    maxRage: 100,\n    skill: ${skillStr}\n${p2}`;
  });
}

// Change Yết Kiêu to Assassin role as requested by user
content = content.replace(
  "name: 'Yết Kiêu',\n    role: 'Support',",
  "name: 'Yết Kiêu',\n    role: 'Assassin',"
);
// Make Phạm Ngũ Lão also Assassin? No, let's make Trần Quốc Toản Assassin for variety, or Yết Kiêu.
content = content.replace(
  "name: 'Trần Quốc Toản',\n    role: 'DPS',",
  "name: 'Trần Quốc Toản',\n    role: 'Assassin',"
);

fs.writeFileSync(file, content);
console.log('Updated gachaPool.ts successfully');
