import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Product from '../models/ProductModel.js';
import BOM from '../models/BOMModel.js';
import User from '../models/UserModel.js';
import WorkCenter from '../models/WorkCenterModel.js';

const seedData = async () => {
  try {
    // Use the same connection string as the server
    await mongoose.connect('mongodb+srv://anupdangi1589:jKSKoEVJSZ3vp8YY@cluster0.jenvr.mongodb.net/manufacturing_erp?retryWrites=true&w=majority');
    console.log('Connected to MongoDB Atlas');

    // Clear existing data
    await Product.deleteMany({});
    await BOM.deleteMany({});
    await User.deleteMany({});
    await WorkCenter.deleteMany({});
    console.log('Cleared existing data');

    // Hash password for users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create sample users
    const user1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: hashedPassword,
      role: 'Manufacturing Manager'
    });

    const user2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password_hash: hashedPassword,
      role: 'Operator'
    });

    // Create work centers
    const workCenter1 = await WorkCenter.create({
      name: 'Assembly Station 1',
      description: 'Main assembly station',
      location: 'Factory Floor A',
      capacity_per_hour: 5,
      hourly_rate: 25.00,
      status: 'Active'
    });

    const workCenter2 = await WorkCenter.create({
      name: 'Finishing Station',
      description: 'Finishing and quality control',
      location: 'Factory Floor B',
      capacity_per_hour: 3,
      hourly_rate: 30.00,
      status: 'Active'
    });

    // Create raw materials/components
    const woodenTop = await Product.create({
      name: 'Wooden Table Top',
      sku: 'WTT-001',
      category: 'Raw Material',
      unit_of_measure: 'Units',
      standard_cost: 25.00,
      current_stock: 50,
      reorder_point: 10,
      is_active: true,
      description: 'High-quality wooden table top'
    });

    const tableLeg = await Product.create({
      name: 'Table Leg',
      sku: 'TL-001',
      category: 'Raw Material',
      unit_of_measure: 'Units',
      standard_cost: 8.50,
      current_stock: 200,
      reorder_point: 50,
      is_active: true,
      description: 'Sturdy wooden table leg'
    });

    const screws = await Product.create({
      name: 'Wood Screws',
      sku: 'SCR-001',
      category: 'Raw Material',
      unit_of_measure: 'Units',
      standard_cost: 0.15,
      current_stock: 1000,
      reorder_point: 200,
      is_active: true,
      description: 'Metal wood screws'
    });

    const varnish = await Product.create({
      name: 'Wood Varnish',
      sku: 'VAR-001',
      category: 'Raw Material',
      unit_of_measure: 'Liters',
      standard_cost: 12.00,
      current_stock: 20,
      reorder_point: 5,
      is_active: true,
      description: 'Premium wood varnish'
    });

    // Create finished products
    const woodenTable = await Product.create({
      name: 'Wooden Table',
      sku: 'WT-001',
      category: 'Finished Good',
      unit_of_measure: 'Units',
      standard_cost: 85.00,
      current_stock: 5,
      reorder_point: 2,
      is_active: true,
      description: 'Handcrafted wooden dining table'
    });

    const coffeeTable = await Product.create({
      name: 'Coffee Table',
      sku: 'CT-001',
      category: 'Finished Good',
      unit_of_measure: 'Units',
      standard_cost: 65.00,
      current_stock: 3,
      reorder_point: 1,
      is_active: true,
      description: 'Modern coffee table'
    });

    // Create BOM for Wooden Table
    const woodenTableBOM = await BOM.create({
      reference: 'BOM-WT-001',
      product: woodenTable._id,
      version: '1.0',
      is_active: true,
      components: [
        {
          component_product: woodenTop._id,
          quantity_required: 1,
          wastage_percentage: 5
        },
        {
          component_product: tableLeg._id,
          quantity_required: 4,
          wastage_percentage: 3
        },
        {
          component_product: screws._id,
          quantity_required: 12,
          wastage_percentage: 10
        },
        {
          component_product: varnish._id,
          quantity_required: 1,
          wastage_percentage: 2
        }
      ],
      operations: [
        {
          sequence: 1,
          operation: 'Assembly',
          work_center: workCenter1._id,
          expected_duration: 45,
          description: 'Assemble table components'
        },
        {
          sequence: 2,
          operation: 'Finishing',
          work_center: workCenter2._id,
          expected_duration: 30,
          description: 'Apply varnish and finishing'
        }
      ]
    });

    // Create BOM for Coffee Table
    const coffeeTableBOM = await BOM.create({
      reference: 'BOM-CT-001',
      product: coffeeTable._id,
      version: '1.0',
      is_active: true,
      components: [
        {
          component_product: woodenTop._id,
          quantity_required: 1,
          wastage_percentage: 5
        },
        {
          component_product: tableLeg._id,
          quantity_required: 4,
          wastage_percentage: 3
        },
        {
          component_product: screws._id,
          quantity_required: 8,
          wastage_percentage: 10
        },
        {
          component_product: varnish._id,
          quantity_required: 0.5,
          wastage_percentage: 2
        }
      ],
      operations: [
        {
          sequence: 1,
          operation: 'Assembly',
          work_center: workCenter1._id,
          expected_duration: 30,
          description: 'Assemble coffee table components'
        },
        {
          sequence: 2,
          operation: 'Finishing',
          work_center: workCenter2._id,
          expected_duration: 20,
          description: 'Apply varnish and finishing'
        }
      ]
    });

    console.log('✅ Test data seeded successfully!');
    console.log('\n=== CREATED DATA ===');
    console.log('Users:', await User.countDocuments());
    console.log('Products:', await Product.countDocuments());
    console.log('Work Centers:', await WorkCenter.countDocuments());
    console.log('BOMs:', await BOM.countDocuments());
    
    console.log('\n=== FINISHED GOODS ===');
    const finishedGoods = await Product.find({ category: 'Finished Good' });
    finishedGoods.forEach(p => console.log(`- ${p.name} (${p.sku})`));
    
    console.log('\n=== BOMs ===');
    const boms = await BOM.find().populate('product');
    boms.forEach(b => console.log(`- ${b.reference} for ${b.product.name} (${b.components.length} components)`));

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

seedData();