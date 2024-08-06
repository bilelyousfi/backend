import SubCategory from '../models/SubCategoryModel.js';
import Category from '../models/Category.js';  

const addSubCategory = async (req, res) => {
    const { name } = req.body;
    var avatar =req.file?.filename
    const { categoryId } = req.params; 

    try {
       
        const parentCategory = await Category.findById(categoryId);
        if (!parentCategory) {
            return res.status(404).json({ message: "Parent category not found" });
        }

       
        const newSubCategory = new SubCategory({
            name,
            avatar,
            parent: categoryId  
        });

       
        const savedSubCategory = await newSubCategory.save();

     
        parentCategory.SubCategory.push(savedSubCategory._id);
        await parentCategory.save();

        res.status(201).json({
            status: true,
            message: "Category has been succefully created"
          })
    } catch (error) {
        res.status(500).json({ message: 'Error creating subcategory: ' + error.message });
    }
};

const markSubCategoryAsDeleted = async (req, res) => {
    const { subCategoryId } = req.params;

    try {
        const updatedSubCategory = await SubCategory.findByIdAndUpdate(
            subCategoryId,
            { etatDelete: true },
            { new: true }
        );
        if (!updatedSubCategory) {
            return res.status(404).json({ message: "SubCategory not found" });
        }
        res.status(200).json({ message: 'SubCategory marked as deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking subcategory as deleted: ' + error.message });
    }
};
const getAllSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find({ etatDelete: false }) // Récupérer seulement les sous-catégories non supprimées
            .exec();

        res.status(200).json(subCategories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subcategories: ' + error.message });
    }
};
export default {addSubCategory,markSubCategoryAsDeleted,getAllSubCategories};