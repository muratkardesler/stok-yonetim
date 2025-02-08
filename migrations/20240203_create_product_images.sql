-- Önce mevcut tabloyu sil (eğer varsa)
DROP TABLE IF EXISTS product_images;

-- product_images tablosunu oluştur
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    is_primary BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'unmatched',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- İndeksler
CREATE INDEX idx_product_images_product_name ON product_images(product_name);
CREATE INDEX idx_product_images_user_id ON product_images(user_id);
CREATE INDEX idx_product_images_status ON product_images(status);

-- RLS Politikaları
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi görsellerini görebilir ve yönetebilir
CREATE POLICY "Users can view their own images" ON product_images
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own images" ON product_images
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own images" ON product_images
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own images" ON product_images
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_product_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger
CREATE TRIGGER update_product_images_updated_at
    BEFORE UPDATE ON product_images
    FOR EACH ROW
    EXECUTE FUNCTION update_product_images_updated_at(); 