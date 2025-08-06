const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/?retryWrites=true&w=majority&appName=PoraCred";

async function corrigirClientesPagosSemData() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');
    
    const db = client.db("crm");
    const collection = db.collection("clientes");
    
    // Buscar clientes que estão como "pago" mas não têm data_pagamento
    const clientesPagosSemData = await collection.find({
      status: "pago",
      $or: [
        { data_pagamento: { $exists: false } },
        { data_pagamento: "" },
        { data_pagamento: null }
      ]
    }).toArray();
    
    console.log(`Encontrados ${clientesPagosSemData.length} clientes pagos sem data de pagamento`);
    
    if (clientesPagosSemData.length > 0) {
      // Atualizar cada cliente
      for (const cliente of clientesPagosSemData) {
        const dataPagamento = cliente.data || new Date().toISOString().split('T')[0];
        
        await collection.updateOne(
          { _id: cliente._id },
          { 
            $set: { 
              data_pagamento: dataPagamento 
            } 
          }
        );
        
        console.log(`Cliente "${cliente.cliente}" atualizado com data de pagamento: ${dataPagamento}`);
      }
      
      console.log('✅ Todos os clientes pagos foram corrigidos com data de pagamento!');
    } else {
      console.log('✅ Todos os clientes pagos já possuem data de pagamento.');
    }
    
  } catch (error) {
    console.error('Erro ao corrigir clientes:', error);
  } finally {
    await client.close();
  }
}

corrigirClientesPagosSemData().catch(console.error); 