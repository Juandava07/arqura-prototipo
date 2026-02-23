import pandas as pd
import random
from datetime import datetime, timedelta

def generate_sample_xlsx():
    customers = ["Ana Torres", "Pedro Valencia", "Diego Perez", "Pedro Rodriguez", "Ana Garcia", 
                 "Sofia Ramirez", "Elena Gomez", "Maria Martinez", "Pedro Perez", "Elena Sanchez",
                 "Diego Torres", "Carlos Martinez", "Laura Gomez", "Luis Rodriguez", "Juan Garcia"]
    
    # Materiales reales basados en los assets/products detectados
    # Formato Nombre:ML,Fondo
    materials_pool = [
        "Granito Silver:2.5,60", 
        "Granito Amarillo:1.8,60", 
        "Granito Jaspe:3.2,60",
        "Cuarzo Blanco:2.4,60",
        "Cuarzo Blanco Polar:4.1,60",
        "Cuarzo Anubis:1.5,60",
        "Mármol Blanco:3.0,60",
        "Mármol Verde:2.2,60",
        "Mármol Kenia Black:1.9,60",
        "Sinterizado Carrara:4.5,60",
        "Sinterizado Blanco:3.3,60"
    ]

    data = []
    start_date = datetime.now()

    for i in range(1, 51):
        order_id = f"ARQ-{1000 + i}"
        customer = random.choice(customers)
        cedula = random.randint(1000000, 99999999)
        movil = f"573{random.randint(10, 25)}{random.randint(100, 999)}{random.randint(1000, 9999)}"
        delivery_date = (start_date + timedelta(days=random.randint(5, 30))).strftime("%Y-%m-%d")
        
        # Seleccionar 1 o 2 materiales aleatorios
        num_mats = random.randint(1, 2)
        mats_selected = random.sample(materials_pool, num_mats)
        mats_str = "; ".join(mats_selected)
        
        # Calcular un total ficticio basado en cantidad de materiales
        total = num_mats * random.randint(1200000, 2500000)

        data.append([order_id, customer, cedula, movil, delivery_date, total, mats_str])

    df = pd.DataFrame(data, columns=["ID", "Cliente", "Cédula", "Móvil", "Entrega", "Total", "Materiales"])
    
    output_file = "pedidos_arqura_importar.xlsx"
    df.to_excel(output_file, index=False)
    print(f"Archivo generado exitosamente: {output_file}")

if __name__ == "__main__":
    generate_sample_xlsx()
