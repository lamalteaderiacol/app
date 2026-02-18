
import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Fresa Explosiva',
    description: 'Helado de fresa natural con trozos de fruta, jarabe artesanal y crema batida.',
    price: 85.00,
    category: 'Clásicas',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDncnt8Bp8u2VV_7xND3AIAsYpc5TF3a6J0hJ4Heulf8FEOPEW2c_Bjf21qUeZxshr6qqZIlC20HEEWqssjaGu0_s733Uywz9JceRPkmOZskStPE9xv1sWbQRyK16PiQXh5hC0DxuR19w-1FRagerXN0a-khA-8fpC1WZzVgtgCLKQ-Y-0FmUF96tUJk4CM3gZ1ya-r9HY_thCTJSpZw0Cpnzam9q6keBaKzj57aIuLNThyVuhsPMzfM53_B4drDA3UyH0Aw2BKrfPf',
    available: true
  },
  {
    id: '2',
    name: 'Chocolate Real',
    description: 'Cacao intenso de origen con chispas de chocolate belga y fudge casero.',
    price: 90.00,
    category: 'Clásicas',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvPec7Yz_9sTjeQ6W8PdVjIr0ETDqOUsYJQSONeUEuYLJEwG0f-jgsBaahTynAEATAK4OdXB6LkmlnH0Rya-NwYg8V1QBQBkYxumJveIzjq7lXahtTIFnHjobX-bP4Hc7q85ZykQrV1SVekQO-Mx4ifRXxuz4eY_Z-VkR2OXWSILFWjp9ocT7k4dKfNR0DjQLek9hXJqw7LnOQz7I6p5Kyus-uZ935u7S-taZgqTkJEoKoXAoox0dYZWv_MaPuBKwXhr7l4FgPdT68',
    available: true
  },
  {
    id: '3',
    name: 'Vainilla Cookies',
    description: 'Vainilla clásica de vaina con trozos de galleta Oreo y mini bombones.',
    price: 95.00,
    category: 'Premium',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYBFiQhp0HG-u_HQ19_PubhMchJm5ChEuIc3PYvtri1KohaNBoUCcKZYPNRjzRpaU8omNsacwYmba-cVgTbdKstMK4G3JEWKP4wa7sJ3SEN6z6-UcYVHx8x9vUJeTowLPehkgfs0bxB_LtvNczUVWsHHizXar7XaksRu_8YezThFJoStEcTwkXil6GSWaMTRn6nCuROnuGvKcas4MFd1iDZ235Aj8x-O7-6Gr-oySb-vcloYkMIBhJ-WXlfWq1hhGNuPXBVJFFxyp6',
    available: true
  },
  {
    id: '4',
    name: 'Mora Azul',
    description: 'Mix de bayas silvestres frescas, sorbete de mora azul y topping de arándanos.',
    price: 85.00,
    category: 'Especiales',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABfIqKZsnzdmxJC1FgRHicWhAtZI4dIp4E3vZgO6vobyVScnbAWfD-JltrwPRDMj3vLkKaCL2fFbbPwc8xOu7eIpXb4JDP_t0omFi2fU1h7vGJ6qEh4Jx__NXnmDkS_1eOPs101Km2bYn2M7LBrFyxveEe-8MBFc8nXjrx7Zqvz7sunxP_FxJirVrUFU9eQ91uKm-CIV-jyj926JKgYYj0jTBNmSIf797IO06IeNgLTZ7Wnidj0DK7yVNoYWFCn31oJ0D2dyCRa-9t',
    available: true
  },
  {
    id: '5',
    name: 'Caramelo Salado',
    description: 'Dulce de leche quemado con un toque de sal de mar y crujiente de nuez.',
    price: 95.00,
    category: 'Premium',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEwsbL6gzH8f5uarZvZwqarGfZy5MkEe4SQiCa4sWWQ2Ch3M18yaddBgPe8o1YwoWU9GIsT49HhPocYmFHt1GMQLwiyW8ZYjH85JvJwzffm7vHjRPfnbOomYwtrmxzD1wPeQEdMSI7L9xzzKiOztKYkNczi4p-sj2W-nNNHTPl_k1A8hwf1rrsOJLSGpiGdCupQ8_p53lwkkKgtc1eAMu6XcrQkdGwvk_y7XB2JMKsLbl5yrwWzQcILF9rXsuqdFrwYDxeMeT8jms-',
    available: true
  },
  {
    id: '6',
    name: 'Menta Choco',
    description: 'Refrescante menta natural con chispas de chocolate amargo 70% cacao.',
    price: 90.00,
    category: 'Clásicas',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRUq1YPga-sR9qw9ZpOf6lY6sl_yHM3BBSa_246ZZTnpH_nfbRh2vJeasAWsGkb-uYbJWgwqjWlZJEoVMD_i7mEgYrXeai0zumZ6qNS7T8lREujFUx7Rh8HYGQWU43OmwqXQVbwVsfecmw40GaPtp-XESwXtUqiVN266Q6dHug9WhbTZ4P1AptOeee9W2tnBcsyzZWI4ASli5eLh3gkORW7vD0RcVxH5ZlsagAFLjCQg65a2u8qc73sWap0zSW2irluVu3WxPQi1so',
    available: true
  }
];

export const HERO_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNbhebxzar0g37X0Cu_ZUtaBxH37jc60pKnZ3pi7EOXNdP2pwJ6AAQEOK4tocgaaUF28N69cIQyAYj6EX3u1AGPqpQ1Au635IR5rZ_GIFa8TYDRT0WpkU7qD5eIxZxCuDyVaCdLMe2qS40c1BOHxycuIrasKokl-VW4J8wR5-mjMuQyoPU8-WaSRq6-OuYMoNwwAtqn4IsGRqdR70FTgaPrnAPAdR0BO7mgOyBNuo9ZFd1YkD6aW7OvX25DPcJBUEBU18IsoVKX5SH';

export const ADMIN_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIz0236ZLr_BoNdm9FnGhvSZ0UGJxqcZusDXLkcQXsUiq0O_j9l4Oaduo90u-ULJUdOaun3bZV87s2B707jt42UYuYse-xTtvSSG-nwmoqH0AEpEistZZ5rxAWrSdqK6LJEmxCXeuV1E2LA0rTFXqa98OS8hmPdd3Q067_WmNo6ie9_eEb4AU46tqdIl0ZonIIQySZgdt1g3cOCl7b27r27ABUFbzueRbEEocKZB67iAwtIoajcNXk3ml_ZZ_KhHxGEaGeo7QLbLlS';
