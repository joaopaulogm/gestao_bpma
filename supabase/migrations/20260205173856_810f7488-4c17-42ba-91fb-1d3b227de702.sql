-- Add data_hash column to radio_operador_data for incremental sync
ALTER TABLE public.radio_operador_data 
ADD COLUMN IF NOT EXISTS data_hash TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_radio_operador_data_sheet_row 
ON public.radio_operador_data(sheet_name, row_index);

CREATE INDEX IF NOT EXISTS idx_radio_operador_data_hash 
ON public.radio_operador_data(data_hash);